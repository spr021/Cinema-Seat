import { Request, Response } from "express"
import Show from "../models/show.model"
import Movie from "../models/movie.model"
import { layout1, layout2 } from "../constant/seat.layout"
import Seat from "../models/seat.model"

const createShows = async (req: Request, res: Response) => {
  const { movieId } = req.params
  const { date, hall_id, movie_id } = req.body

  if (!date) {
    res.status(400).json({ message: "input at least one date" })
  }

  try {
    let selectedHall = null
    switch (+hall_id) {
      case 1:
        selectedHall = layout1.seats
        break
      case 2:
        selectedHall = layout2.seats // Replace with actual layout2 when defined
        break
      default:
        return res.status(400).json({ message: "Invalid hallId" })
    }

    const seats = await Seat.create(selectedHall)
    const show = await Show.create({ date, seats, movie_id, hall_id })
    await Movie.findByIdAndUpdate(movieId, { $push: { shows: show._id } })
    res.status(200).json(show)
  } catch (error) {
    return res.status(500).json({ message: "Error creating show", error })
  }
}

const getShowsByMovieId = async (req: Request, res: Response) => {
  const { movieId } = req.params
  const movie = await Movie.findById(movieId)
  if (!movie) {
    res.status(400).json({ message: "movie not found" })
  }
  const shows = await Show.find({
    _id: { $in: movie?.shows },
  })

  if (!shows) {
    res.status(400).json({ message: "shows not found" })
  }
  await shows[0].populate("seats")
  res.status(200).json(shows)
}

const getShowById = async (req: Request, res: Response) => {
  const { showId } = req.params
  const show = await Show.findById(showId).populate("seats")
  if (!show) {
    res.status(500).json({ message: "show not found" })
  }
  res.status(200).json(show)
}

const updateShowById = async (req: Request, res: Response) => {
  const { showId } = req.params
  // cant update seats here | use seats api
  delete req.body.seats
  const show = await Show.findByIdAndUpdate(showId, req.body)
  if (!show) {
    res.status(400).json({ message: "Show not found" })
  }
  const updatedShow = await Show.findById(showId)
  res.status(200).json(updatedShow)
}

const deleteShowById = async (req: Request, res: Response) => {
  const { showId } = req.params
  const show = await Show.findById(showId)
  if (!show) {
    res.status(400).json({ message: "Show not found" })
  }
  await Seat.deleteMany({ _id: { $in: show?.seats } })
  await Show.findByIdAndDelete(showId)
  res.status(200).json({ message: "Show deleted successfully" })
}

const deleteAllShowsByMovieId = async (req: Request, res: Response) => {
  const { movieId } = req.params
  const movie = await Movie.findById(movieId)
  if (!movie) {
    res.status(400).json({ message: "Movie not found" })
  }

  const shows = await Show.find({ _id: { $in: movie?.shows } })
  if (!shows.length) {
    return res.status(404).json({ message: "No shows found for this movie" })
  }
  for (const show of shows) {
    await Seat.deleteMany({ _id: { $in: show.seats } })
  }
  await Show.deleteMany({ _id: { $in: movie?.shows } })

  movie!.shows = []
  await movie?.save()
  res.status(200).json({ message: "All shows deleted successfully" })
}

const getAllShows = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query
    const query: any = {}

    if (start && end) {
      query.date = {
        $gte: start,
        $lte: end,
      }
    }

    const shows = await Show.find(query)
    res.status(200).json(shows)
  } catch (error) {
    res.status(500).json({ message: "Error getting all shows", error })
  }
}

export {
  createShows,
  getShowsByMovieId,
  getShowById,
  updateShowById,
  deleteShowById,
  deleteAllShowsByMovieId,
  getAllShows,
}
