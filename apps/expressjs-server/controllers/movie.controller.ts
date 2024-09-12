import { Request, Response } from "express"
import Movie from "../models/movie.model"

const getMovies = async (req: Request, res: Response) => {
  try {
    const movies = await Movie.find({})
    res.status(200).json(movies)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const movie = await Movie.findById(id)
    res.status(200).json(movie)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const createMovie = async (req: Request, res: Response) => {
  try {
    const movie = await Movie.create(req.body)
    res.status(200).json(movie)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const updateMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const movie = await Movie.findByIdAndUpdate(id, req.body)
    if (!movie) {
      res.status(400).json({ message: "Movie not found" })
    }
    const updatedMovie = await Movie.findById(id)
    res.status(200).json(updatedMovie)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const deleteMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const movie = await Movie.findByIdAndDelete(id)
    if (!movie) {
      res.status(400).json({ message: "Movie not found" })
    }
    res.status(200).json({ message: "Movie deleted successfully" })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

export {
  getMovies,
  getMovieById,
  createMovie,
  updateMovieById,
  deleteMovieById,
}
