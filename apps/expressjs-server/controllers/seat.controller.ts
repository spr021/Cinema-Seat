import { Request, Response } from "express"
import Seat from "../models/seat.model"
import Show from "../models/show.model"

const getSeatById = async (req: Request, res: Response) => {
  const { seatId } = req.params
  const seat = await Seat.findById(seatId)
  if (!seat) {
    res.status(400).json({ message: "seat not found!" })
  }
  res.status(200).json(seat)
}

const getSeatsByShowId = async (req: Request, res: Response) => {
  const { showId } = req.params
  const show = await Show.findById(showId).populate("seats")
  if (!show) {
    res.status(400).json({ message: "show not found!" })
  }
  res.status(200).json(show?.seats)
}

const updateSeatById = async (req: Request, res: Response) => {
  const { seatId } = req.params
  const seat = await Seat.findByIdAndUpdate(seatId, req.body)
  if (!seat) {
    res.status(400).json({ message: "seat not found" })
  }
  const updatedSeat = await Seat.findById(seatId)
  res.status(200).json(updatedSeat)
}

const reserveMultipleSeats = async (req: Request, res: Response) => {
  const { seatIds, reservedBy } = req.body

  console.log("Received request for reserveMultipleSeats:", {
    seatIds,
    reservedBy,
  })

  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return res
      .status(400)
      .json({ message: "seatIds must be a non-empty array." })
  }
  if (!reservedBy) {
    return res.status(400).json({ message: "reservedBy is required." })
  }

  try {
    const updatedSeats = []
    for (const seatId of seatIds) {
      console.log(`Attempting to reserve seat: ${seatId}`)
      const seat = await Seat.findById(seatId)
      if (!seat) {
        console.error(`Seat with ID ${seatId} not found.`)
        return res
          .status(404)
          .json({ message: `Seat with ID ${seatId} not found.` })
      }
      if (!seat.isAvailable) {
        console.warn(`Seat ${seat.row}${seat.seatNumber} is already reserved.`)
        return res.status(409).json({
          message: `Seat ${seat.row}${seat.seatNumber} is already reserved.`,
        })
      }

      const updatedSeat = await Seat.findByIdAndUpdate(
        seatId,
        { isAvailable: false, reservedBy: reservedBy },
        { new: true }
      )
      updatedSeats.push(updatedSeat)
      console.log(`Successfully reserved seat: ${seatId}`)
    }
    res.status(200).json({
      message: "Seats reserved successfully",
      updatedSeats,
      success: true, // Add a success flag
    })
  } catch (error: any) {
    console.error("Error reserving seats:", error)
    res.status(500).json({
      message: error.message || "Failed to reserve seats.",
      success: false, // Add a success flag
    })
  }
}

export { getSeatById, getSeatsByShowId, updateSeatById, reserveMultipleSeats }
