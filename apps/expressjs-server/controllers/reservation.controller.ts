import { Request, Response } from "express"
import Reservation from "../models/reservation.model"
import Ticket from "../models/ticket.model" // Import Ticket model
import Show from "../models/show.model" // Import Show model
import { startSession } from "mongoose"
import Seat from "../models/seat.model"
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
    res.status(400).json({ message: "reservation not found!" })
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
      populate: [
        { path: "movie_id", select: "title img" },
        { path: "hall_id", select: "name" },
      ],
    })

  if (!reservations) {
    return res.status(200).json([]) // Return empty array if no reservations found
  }
  console.log(reservations)

  res.status(200).json(reservations)
}

const releaseSeat = async (seat_id: ObjectId) => {
  const seat = await Seat.findById(seat_id)

  if (seat && !seat.isAvailable && !seat.reservedBy) {
    // Check if the seat is not confirmed (e.g., no reservedBy information) and reset it.
    seat.isAvailable = true
    await seat.save()
  }
}

const createReservation = async (req: Request, res: Response) => {
  const session = await startSession()
  try {
    session.startTransaction()
    const { user_id, seat_ids, show_id } = req.body
    const seat_ids_array = JSON.parse(seat_ids)

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required." })
    }
    const userObjectId = new ObjectId(user_id)

    if (!seat_ids_array.length) {
      res.status(400).json({ message: "input at least one seat id" })
    }

    const seats = await Seat.find({ _id: { $in: seat_ids_array } }).session(
      session
    )

    if (!seats.length) {
      return res.status(404).send("Seat(s) not found")
    }

    for (const seat of seats) {
      if (!seat.isAvailable) {
        throw new Error(
          `${seat.row}${seat.seatNumber} seat is already reserved`
        )
      }
      // Optimistically lock the seat by checking the version
      seat.isAvailable = false
      seat.reservedBy = userObjectId
      await seat.save({ session })

      setTimeout(() => releaseSeat(seat._id), 1000 * 60 * 15) //15 min
    }

    const reservation = await Reservation.create({
      user_id: userObjectId,
      seat_ids: seat_ids_array,
      show_id: new ObjectId(show_id),
    })

    // Commit the transaction if everything goes well
    await session.commitTransaction()
    session.endSession()

    return res.status(200).send(reservation)
  } catch (error) {
    // Rollback transaction in case of any error
    await session.abortTransaction()
    session.endSession()
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const markReservationAsPaid = async (req: Request, res: Response) => {
  try {
    const { reservationId } = req.params
    const reservation = await Reservation.findByIdAndUpdate(
      reservationId,
      { is_paid: true },
      { new: true }
    ).populate("show_id") // Populate show_id to get details for ticket creation

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found." })
    }

    // Assuming a default price per seat for now, as Show model doesn't have it.
    // In a real application, this price would come from the Show or Movie model.
    const PRICE_PER_SEAT = 10
    const totalPrice = reservation.seat_ids.length * PRICE_PER_SEAT

    // Create a new Ticket document
    const ticket = await Ticket.create({
      user_id: reservation.user_id,
      show_id: reservation.show_id,
      seat_ids: reservation.seat_ids,
      reservation_id: reservation._id,
      price: totalPrice,
      purchase_date: new Date(),
    })

    res
      .status(200)
      .json({
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
