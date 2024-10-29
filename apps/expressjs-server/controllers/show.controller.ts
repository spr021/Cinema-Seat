import { Request, Response } from "express"
import Show from "../models/show.model"
import Movie from "../models/movie.model"
import { layout1 } from "../constant/seat.layout"
import Seat from "../models/seat.model"

const createShows = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params
    const { dates } = req.body
    const dates_array = JSON.parse(dates)

    if (!dates_array.length) {
      res.status(400).json({ message: "input at least one date" })
    }

    const listOfShows: any[] = []

    for (const date of dates_array) {
      try {
        const seats = await Seat.create(layout1)
        listOfShows.push(new Show({ date, seats }))
      } catch (error) {
        return res.status(500).json({ message: "Error creating show", error })
      }
    }
    const shows = await Show.create(listOfShows)
    await Movie.findByIdAndUpdate(movieId, { $push: { shows } })
    res.status(200).json(shows)
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
    await shows[0].populate("seats")
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
    const show = await Show.findById(showId).populate("seats")
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
    // cant update seats here | use seats api
    delete req.body.seats
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
    const show = await Show.findById(showId)
    if (!show) {
      res.status(400).json({ message: "Show not found" })
    }
    await Seat.deleteMany({ _id: { $in: show?.seats } })
    await Show.findByIdAndDelete(showId)
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
