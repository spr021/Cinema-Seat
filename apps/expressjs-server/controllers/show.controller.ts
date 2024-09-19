import { Request, Response } from "express"
import Show from "../models/show.model"
import Movie from "../models/movie.model"

const createShows = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params
    // todo
    const dates = req.body.dates
      .substring(1, req.body.dates.length - 1)
      .split(",")
    const shows: any[] = []
    if (!dates.length) {
      res.status(400).json({ message: "input at least one date" })
    }
    for (let i = 0; i < dates.length; i++) {
      shows.push(
        new Show({
          date: dates[i],
          seats: [],
        })
      )
    }
    const setShows = await Show.create(shows)
    await Movie.findByIdAndUpdate(movieId, { shows: setShows })
    res.status(200).json(setShows)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const getShowsByMovieId = async (req: Request, res: Response) => {
  try {
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
    res.status(200).json(shows)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const getShowById = async (req: Request, res: Response) => {
  try {
    const { showId } = req.params
    const show = await Show.findById(showId)
    if (!show) {
      res.status(500).json({ message: "show not found" })
    }
    res.status(200).json(show)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const updateShowById = async (req: Request, res: Response) => {
  try {
    const { showId } = req.params
    // need to fix seats update
    const show = await Show.findByIdAndUpdate(showId, req.body)
    if (!show) {
      res.status(400).json({ message: "Show not found" })
    }
    const updatedShow = await Show.findById(showId)
    res.status(200).json(updatedShow)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const deleteShowById = async (req: Request, res: Response) => {
  try {
    const { showId } = req.params
    const show = await Show.findByIdAndDelete(showId)
    if (!show) {
      res.status(400).json({ message: "Show not found" })
    }
    res.status(200).json({ message: "Show deleted successfully" })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const deleteAllShowsByMovieId = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params
    const movie = await Movie.findByIdAndUpdate(movieId, { shows: [] })
    if (!movie) {
      res.status(400).json({ message: "Movie not found" })
    }
    res.status(200).json({ message: "All shows deleted successfully" })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

export {
  createShows,
  getShowsByMovieId,
  getShowById,
  updateShowById,
  deleteShowById,
  deleteAllShowsByMovieId,
}
