import { Request, Response } from "express"
import Reservation from "../models/reservation.model"
import { startSession } from "mongoose"
import Seat from "../models/seat.model"
import { ObjectId } from "mongodb"

const getReservationById = async (req: Request, res: Response) => {
    const { reservationId } = req.params
    const reservation = await Reservation.findById(reservationId)
    if (!reservation) {
      res.status(400).json({ message: "reservation not found!" })
    }
    res.status(200).json(reservation)
}

const getReservationsByUserId = async (req: Request, res: Response) => {
    const { userId } = req.params
    const reservations = await Reservation.find({ user_id: userId })
    if (!reservations) {
      res.status(400).json({ message: "reservations not found" })
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
    const { user_id, seat_ids } = req.body
    const seat_ids_array = JSON.parse(seat_ids)
    
    if (!seat_ids_array.length) {
      res.status(400).json({ message: "input at least one seat id" })
    }

    const seats = await Seat.find({ _id: { $in: seat_ids_array } }).session(session)

    if (!seats.length) {
      return res.status(404).send("Seat(s) not found")
    }

    for (const seat of seats) {
      if (!seat.isAvailable) {
        throw new Error(`${seat.row}${seat.seatNumber} seat is already reserved`)
      }
      // Optimistically lock the seat by checking the version
      seat.isAvailable = false
      seat.reservedBy = user_id
      await seat.save({ session })

      setTimeout(() => releaseSeat(seat._id), 1000 * 60 * 15) //15 min
    }

    const reservation = await Reservation.create({...req.body, seat_ids: seat_ids_array})

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

export { getReservationById, getReservationsByUserId, createReservation }
