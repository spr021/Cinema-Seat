import { Request, Response } from "express"
import Seat from "../models/seat.model"
import Show from "../models/show.model"

const getSeatById = async (req: Request, res: Response) => {
  try {
    const { seatId } = req.params
    const seat = await Seat.findById(seatId)
    if (!seat) {
      res.status(400).json({ message: "seat not found!" })
    }
    res.status(200).json(seat)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const getSeatsByShowId = async (req: Request, res: Response) => {
  try {
    const { showId } = req.params
    const show = await Show.findById(showId).populate("seats")
    if (!show) {
      res.status(400).json({ message: "show not found!" })
    }
    res.status(200).json(show?.seats)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const updateSeatById = async (req: Request, res: Response) => {
  try {
    const { seatId } = req.params
    const seat = await Seat.findByIdAndUpdate(seatId, req.body)
    if (!seat) {
      res.status(400).json({ message: "seat not found" })
    }
    const updatedSeat = await Seat.findById(seatId)
    res.status(200).json(updatedSeat)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

export { getSeatById, getSeatsByShowId, updateSeatById }
