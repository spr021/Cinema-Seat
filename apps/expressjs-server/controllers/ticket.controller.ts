import { Request, Response } from "express"
import Ticket from "../models/ticket.model"
import User from "../models/user.model"
import Movie from "../models/movie.model"
import Show from "../models/show.model"
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

// @desc    Aggregate numbers for the admin dashboard
// @route   GET /api/v1/ticket/stats
// @access  Private/Admin
const getStats = async (req: Request, res: Response) => {
  try {
    const [totalUsers, totalMovies, totalShows, revenueAgg] =
      await Promise.all([
        User.countDocuments(),
        Movie.countDocuments(),
        Show.countDocuments(),
        Ticket.aggregate([
          {
            $group: {
              _id: null,
              revenue: { $sum: "$price" },
              ticketsSold: { $sum: 1 },
            },
          },
        ]),
      ])

    res.status(200).json({
      totalUsers,
      totalMovies,
      totalShows,
      totalTickets: revenueAgg[0]?.ticketsSold ?? 0,
      totalRevenue: revenueAgg[0]?.revenue ?? 0,
    })
  } catch (error) {
    console.error("Error getting stats:", error)
    res.status(500).json({ message: "An error occurred while getting stats." })
  }
}

// @desc    Charts data for the admin dashboard
// @route   GET /api/v1/ticket/analytics
// @access  Private/Admin
const getAnalytics = async (req: Request, res: Response) => {
  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Revenue per day over the last 30 days
    const revenueByDay = await Ticket.aggregate([
      { $match: { purchase_date: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$purchase_date" },
          },
          revenue: { $sum: "$price" },
          tickets: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, day: "$_id", revenue: 1, tickets: 1 } },
    ])

    // Best selling movies (by seats sold across all their shows)
    const topMovies = await Ticket.aggregate([
      {
        $group: {
          _id: "$show_id",
          ticketsSold: { $sum: { $size: "$seat_ids" } },
          revenue: { $sum: "$price" },
        },
      },
      { $sort: { ticketsSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "shows",
          localField: "_id",
          foreignField: "_id",
          as: "show",
        },
      },
      { $unwind: "$show" },
      {
        $lookup: {
          from: "movies",
          localField: "show.movie_id",
          foreignField: "_id",
          as: "movie",
        },
      },
      { $unwind: "$movie" },
      {
        $group: {
          _id: "$movie._id",
          title: { $first: "$movie.title" },
          ticketsSold: { $sum: "$ticketsSold" },
          revenue: { $sum: "$revenue" },
        },
      },
      { $sort: { ticketsSold: -1 } },
      { $project: { _id: 0, title: 1, ticketsSold: 1, revenue: 1 } },
    ])

    // Occupancy per show: taken seats vs total seats
    const occupancy = await Show.aggregate([
      {
        $lookup: {
          from: "seats",
          let: { seatIds: "$seats" },
          pipeline: [
            { $match: { $expr: { $in: ["$_id", "$$seatIds"] } } },
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                taken: {
                  $sum: {
                    $cond: [{ $ne: ["$reservedBy", null] }, 1, 0],
                  },
                },
              },
            },
          ],
          as: "stats",
        },
      },
      { $unwind: { path: "$stats", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          showId: { $toString: "$_id" },
          date: 1,
          totalSeats: { $ifNull: ["$stats.total", 0] },
          takenSeats: { $ifNull: ["$stats.taken", 0] },
        },
      },
      { $sort: { date: 1 } },
    ])

    res.status(200).json({ revenueByDay, topMovies, occupancy })
  } catch (error) {
    console.error("Error getting analytics:", error)
    res
      .status(500)
      .json({ message: "An error occurred while getting analytics." })
  }
}

export { getTicketsByUserId, validateTicket, getStats, getAnalytics }
