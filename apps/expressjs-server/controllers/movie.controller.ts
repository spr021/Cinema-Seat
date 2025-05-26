import { Request, Response, NextFunction } from "express"
import Movie from "../models/movie.model"
import Show from "../models/show.model"
import Seat from "../models/seat.model"

const checkUserId = (
  req: Request,
  res: Response,
  next: NextFunction,
  val: string
) => {
  if (!val) {
    return res.status(400).json({ message: "id is not valid" })
  }
  next()
}

const getMovies = async (req: Request, res: Response) => {
  const movies = await Movie.find({})
  res.status(200).json(movies)
}

const getMovieById = async (req: Request, res: Response) => {
  const { id } = req.params
  const movie = await Movie.findById(id)
    .populate("shows")
    .populate({
      path: "shows",
      populate: {
        path: "seats",
        model: "Seat",
      },
    })
  res.status(200).json(movie)
}

const createMovie = async (req: Request, res: Response) => {
  const movie = await Movie.create(req.body)
  res.status(200).json(movie)
}

const updateMovieById = async (req: Request, res: Response) => {
  const { id } = req.params
  // cant update shows here, update with shows api
  delete req.params.shows
  const movie = await Movie.findByIdAndUpdate(id, req.body)
  if (!movie) {
    res.status(400).json({ message: "Movie not found" })
  }
  const updatedMovie = await Movie.findById(id)
  res.status(200).json(updatedMovie)
}

const deleteMovieById = async (req: Request, res: Response) => {
  const { id } = req.params
  const movie = await Movie.findById(id)
  if (!movie) {
    res.status(400).json({ message: "Movie not found" })
  }
  const shows = await Show.find({ _id: { $in: movie?.shows } })
  for (const show of shows) {
    await Seat.deleteMany({ _id: { $in: show.seats } })
  }
  await Show.deleteMany({ _id: { $in: movie?.shows } })
  await Movie.findByIdAndDelete(id)
  res.status(200).json({ message: "Movie deleted successfully" })
}

export {
  checkUserId,
  getMovies,
  getMovieById,
  createMovie,
  updateMovieById,
  deleteMovieById,
}
