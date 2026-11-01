import { Request, Response } from "express"
import Reservation from "../models/reservation.model"
import Ticket from "../models/ticket.model" // Import Ticket model
import Show from "../models/show.model" // Import Show model
import Seat from "../models/seat.model"
import { layout1, layout2 } from "../constant/seat.layout"
import { isBookableBy } from "../utils/seat"
import { broadcastSeatsForSeatIds } from "../services/realtime"
import { ObjectId } from "mongodb"

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    roles: string[]
  }
}

const getReservationById = async (req: Request, res: Response) => {
  const { reservationId } = req.params
  const reservation = await Reservation.findById(reservationId)
  if (!reservation) {
    return res.status(404).json({ message: "reservation not found!" })
  }
  res.status(200).json(reservation)
}

const getReservationsByUserId = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "User not authenticated." })
  }
  const reservations = await Reservation.find({
    user_id: new ObjectId(req.user.id),
  })
    .populate("user_id", "name avatar email")
    .populate("seat_ids", "seatNumber row")
    .populate({
      path: "show_id",
      select: "date movie_id hall_id",
      populate: [{ path: "movie_id", select: "title img" }],
    })

  res.status(200).json(reservations)
}

const createReservation = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  // The reservation always belongs to the authenticated user, never to a
  // user_id passed in the body
  if (!req.user?.id) {
    return res.status(401).json({ message: "User not authenticated." })
  }
  const userObjectId = new ObjectId(req.user.id)
  const { seat_ids, show_id } = req.body

  // The mobile app sends seat_ids as a JSON string; accept both forms
  let seat_ids_array: string[]
  try {
    seat_ids_array =
      typeof seat_ids === "string" ? JSON.parse(seat_ids) : seat_ids
  } catch {
    return res.status(400).json({ message: "seat_ids must be valid JSON" })
  }

  if (!Array.isArray(seat_ids_array) || seat_ids_array.length === 0) {
    return res.status(400).json({ message: "input at least one seat id" })
  }
  if (!show_id) {
    return res.status(400).json({ message: "show_id is required." })
  }

  const show = await Show.findById(show_id)
  if (!show) {
    return res.status(404).json({ message: "Show not found." })
  }

  // All seats must belong to the selected show, otherwise reserving would
  // flip seats of a different screening
  const showSeatIds = show.seats.map((id) => String(id))
  const foreignSeats = seat_ids_array.filter(
    (seatId) => !showSeatIds.includes(String(seatId))
  )
  if (foreignSeats.length > 0) {
    return res
      .status(400)
      .json({ message: "Some seats do not belong to this show." })
  }

  const seats = await Seat.find({ _id: { $in: seat_ids_array } })

  if (seats.length !== seat_ids_array.length) {
    return res.status(404).json({ message: "Seat(s) not found" })
  }

  for (const seat of seats) {
    if (!isBookableBy(seat, req.user.id)) {
      const heldBySomeoneElse =
        seat.holdBy && seat.holdUntil && seat.holdUntil.getTime() > Date.now()
      return res.status(409).json({
        message: heldBySomeoneElse
          ? `${seat.row}${seat.seatNumber} is on hold for another user`
          : `${seat.row}${seat.seatNumber} seat is already reserved`,
      })
    }
  }

  try {
    // Reserve all seats first; roll back if creating the reservation fails
    const reservedSeatIds: string[] = []
    for (const seat of seats) {
      const updated = await Seat.findOneAndUpdate(
        {
          _id: seat._id,
          isAvailable: true,
          $or: [
            { holdBy: null, holdUntil: null },
            { holdUntil: { $lte: new Date() } },
            { holdBy: userObjectId },
          ],
        },
        {
          isAvailable: false,
          reservedBy: userObjectId,
          holdBy: null,
          holdUntil: null, // hold is consumed by the reservation
        },
        { new: true }
      )
      if (!updated) {
        throw new Error(
          `${seat.row}${seat.seatNumber} seat was just taken by someone else`
        )
      }
      reservedSeatIds.push(String(seat._id))
    }

    const reservation = await Reservation.create({
      user_id: userObjectId,
      seat_ids: seat_ids_array,
      show_id: new ObjectId(show_id),
    })

    await broadcastSeatsForSeatIds(seat_ids_array)
    return res.status(201).json(reservation)
  } catch (error) {
    // Release any seats we flipped so a failed reservation never holds seats
    await Seat.updateMany(
      { _id: { $in: seat_ids_array }, reservedBy: userObjectId },
      { isAvailable: true, reservedBy: null, holdBy: null, holdUntil: null }
    )
    if (error instanceof Error) {
      return res.status(409).json({ message: error.message })
    }
    return res.status(500).json({ message: "Failed to create reservation." })
  }
}

const markReservationAsPaid = async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.params
    const reservation = await Reservation.findById(reservationId).populate(
      "show_id"
    )

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." })
    }
    if (reservation.is_paid) {
      return res
        .status(400)
        .json({ message: "Reservation has already been paid." })
    }

    reservation.is_paid = true
    await reservation.save()

    // Price per seat comes from the hall layout (e.g. "20$")
    const show = reservation.show_id as {
      hall_id?: string
    } | null
    const hallLayout = show?.hall_id === "1" ? layout1 : layout2
    const pricePerSeat = parseInt(hallLayout.price, 10) || 0
    const totalPrice = reservation.seat_ids.length * pricePerSeat

    // Create a new Ticket document
    const ticket = await Ticket.create({
      user_id: reservation.user_id,
      show_id: reservation.show_id,
      seat_ids: reservation.seat_ids,
      reservation_id: reservation._id,
      price: totalPrice,
      purchase_date: new Date(),
    })

    res.status(200).json({
      message: "Reservation marked as paid and ticket created.",
      reservation,
      ticket,
    })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    } else {
      res.status(500).json({ message: "An unexpected error occurred." })
    }
  }
}

export {
  getReservationById,
  getReservationsByUserId,
  createReservation,
  markReservationAsPaid,
}
