import express, { Request, Response, Router } from "express"
import {
  createMovie,
  deleteMovieById,
  getMovieById,
  getMovies,
  updateMovieById,
} from "../controllers/movie.controller"

const router: Router = express.Router()

router.post("/", createMovie)
router.get("/", getMovies)
router.get("/:id", getMovieById)
router.put("/:id", updateMovieById)
router.delete("/:id", deleteMovieById)

export default router
