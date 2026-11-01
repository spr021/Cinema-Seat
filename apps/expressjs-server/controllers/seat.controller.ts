import { Request, Response } from "express"
import Seat from "../models/seat.model"
import Show from "../models/show.model"
import { HOLD_DURATION_MS, isBookableBy } from "../utils/seat"

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    roles: string[]
  }
}

const getSeatById = async (req: Request, res: Response) => {
  const { seatId } = req.params
  const seat = await Seat.findById(seatId)
  if (!seat) {
    return res.status(404).json({ message: "seat not found!" })
  }
  res.status(200).json(seat)
}

const getSeatsByShowId = async (req: Request, res: Response) => {
  const { showId } = req.params
  const show = await Show.findById(showId).populate("seats")
  if (!show) {
    return res.status(404).json({ message: "show not found!" })
  }
  res.status(200).json(show?.seats)
}

const updateSeatById = async (req: Request, res: Response) => {
  const { seatId } = req.params
  const seat = await Seat.findByIdAndUpdate(seatId, req.body, {
    new: true,
    runValidators: true,
  })
  if (!seat) {
    return res.status(404).json({ message: "seat not found" })
  }
  res.status(200).json(seat)
}

// Reserve seats all-or-nothing: if any seat is taken (or held by someone
// else), nothing is reserved
const reserveMultipleSeats = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const { seatIds, reservedBy } = req.body
  const requester = req.user

  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return res
      .status(400)
      .json({ message: "seatIds must be a non-empty array." })
  }
  if (!reservedBy) {
    return res.status(400).json({ message: "reservedBy is required." })
  }

  try {
    // Reserve each seat conditionally on it still being free for this user,
    // so two concurrent requests can never both win the same seat
    const reserved: { _id: unknown }[] = []
    for (const seatId of seatIds) {
      const seat = await Seat.findById(seatId)
      if (seat && !isBookableBy(seat, requester?.id)) {
        await Seat.updateMany(
          { _id: { $in: reserved.map((s) => s._id) } },
          { isAvailable: true, reservedBy: null, holdBy: null, holdUntil: null }
        )
        return res.status(409).json({
          message: `Seat ${seat.row}${seat.seatNumber} is not available.`,
          success: false,
        })
      }

      const updated = await Seat.findOneAndUpdate(
        {
          _id: seatId,
          isAvailable: true,
          $or: [
            { holdBy: null, holdUntil: null },
            { holdUntil: { $lte: new Date() } },
            { holdBy: reservedBy },
          ],
        },
        {
          isAvailable: false,
          reservedBy: reservedBy,
          holdBy: null,
          holdUntil: null,
        },
        { new: true }
      )
      if (!updated) {
        // Someone else took (at least) this seat meanwhile; undo the ones
        // we already flipped and report the conflict
        await Seat.updateMany(
          { _id: { $in: reserved.map((s) => s._id) } },
          { isAvailable: true, reservedBy: null, holdBy: null, holdUntil: null }
        )
        return res.status(409).json({
          message: `Seat with ID ${seatId} is already reserved.`,
          success: false,
        })
      }
      reserved.push(updated)
    }

    res.status(200).json({
      message: "Seats reserved successfully",
      updatedSeats: reserved,
      success: true,
    })
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Failed to reserve seats.",
      success: false,
    })
  }
}

// Temporarily hold seats (10 min) for the authenticated user while they pay
const holdSeats = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "User not authenticated." })
  }
  const { seatIds } = req.body
  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return res
      .status(400)
      .json({ message: "seatIds must be a non-empty array." })
  }

  const holdUntil = new Date(Date.now() + HOLD_DURATION_MS)
  const held: { _id: unknown }[] = []

  try {
    for (const seatId of seatIds) {
      const seat = await Seat.findOneAndUpdate(
        {
          _id: seatId,
          isAvailable: true,
          $or: [
            { holdBy: null, holdUntil: null },
            { holdUntil: { $lte: new Date() } },
            { holdBy: req.user.id },
          ],
        },
        { holdBy: req.user.id, holdUntil: holdUntil },
        { new: true }
      )
      if (!seat) {
        // Undo holds we already placed and report which seat blocked us
        await Seat.updateMany(
          { _id: { $in: held.map((s) => s._id) } },
          { holdBy: null, holdUntil: null }
        )
        const blocker = await Seat.findById(seatId)
        return res.status(409).json({
          message: blocker
            ? `Seat ${blocker.row}${blocker.seatNumber} is not available.`
            : `Seat with ID ${seatId} not found.`,
          success: false,
        })
      }
      held.push(seat)
    }

    res.status(200).json({
      message: `Seats held for ${HOLD_DURATION_MS / 60000} minutes`,
      holdUntil,
      success: true,
    })
  } catch (error: any) {
    res
      .status(500)
      .json({ message: error.message || "Failed to hold seats.", success: false })
  }
}

// Release the caller's own holds (reservations are untouched)
const releaseHeldSeats = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "User not authenticated." })
  }
  const { seatIds } = req.body
  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return res
      .status(400)
      .json({ message: "seatIds must be a non-empty array." })
  }

  await Seat.updateMany(
    {
      _id: { $in: seatIds },
      holdBy: req.user.id,
      reservedBy: null, // never release an actual reservation
    },
    { holdBy: null, holdUntil: null }
  )

  res.status(200).json({ message: "Holds released", success: true })
}

export {
  getSeatById,
  getSeatsByShowId,
  updateSeatById,
  reserveMultipleSeats,
  holdSeats,
  releaseHeldSeats,
}
