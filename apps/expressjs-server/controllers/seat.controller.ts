import { Request, Response } from "express"
import Seat from "../models/seat.model"
import Show from "../models/show.model"

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

// Reserve seats all-or-nothing: if any seat is taken, nothing is reserved
const reserveMultipleSeats = async (req: Request, res: Response) => {
  const { seatIds, reservedBy } = req.body

  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return res
      .status(400)
      .json({ message: "seatIds must be a non-empty array." })
  }
  if (!reservedBy) {
    return res.status(400).json({ message: "reservedBy is required." })
  }

  try {
    // Reserve each seat conditionally on it still being available, so two
    // concurrent requests can never both win the same seat
    const reserved: { _id: unknown }[] = []
    for (const seatId of seatIds) {
      const seat = await Seat.findOneAndUpdate(
        { _id: seatId, isAvailable: true },
        { isAvailable: false, reservedBy: reservedBy },
        { new: true }
      )
      if (!seat) {
        // Someone else took (at least) this seat meanwhile; undo the ones
        // we already flipped and report the conflict
        await Seat.updateMany(
          { _id: { $in: reserved.map((s) => s._id) } },
          { isAvailable: true, reservedBy: null }
        )
        return res.status(409).json({
          message: `Seat with ID ${seatId} is already reserved.`,
          success: false,
        })
      }
      reserved.push(seat)
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

export { getSeatById, getSeatsByShowId, updateSeatById, reserveMultipleSeats }
