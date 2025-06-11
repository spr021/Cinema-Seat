import { Request, Response } from "express"
import Ticket from "../models/ticket.model"
import { ObjectId } from "mongodb"

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    roles: string[]
  }
}

const getTicketsByUserId = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "User not authenticated." })
  }
  const tickets = await Ticket.find({
    user_id: new ObjectId(req.user.id),
  })
    .populate("user_id", "name avatar email")
    .populate("seat_ids", "seatNumber row")
    .populate({
      path: "show_id",
      select: "date movie_id hall_id",
      populate: [
        { path: "movie_id", select: "title img genre" },
        { path: "hall_id", select: "name" },
      ],
    })
    .populate("reservation_id")

  if (!tickets) {
    return res.status(200).json([]) // Return empty array if no tickets found
  }

  res.status(200).json(tickets)
}

const validateTicket = async (req: Request, res: Response) => {
  const { ticketId } = req.params

  try {
    const ticket = await Ticket.findById(ticketId)

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found." })
    }

    if (ticket.is_used) {
      return res.status(400).json({ message: "Ticket has already been used." })
    }

    ticket.is_used = true
    await ticket.save()

    res.status(200).json({ message: "Ticket validated successfully." })
  } catch (error) {
    console.error("Error validating ticket:", error)
    res
      .status(500)
      .json({ message: "An error occurred while validating the ticket." })
  }
}

export { getTicketsByUserId, validateTicket }
