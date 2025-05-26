import express, { Router } from "express"
import {
  checkUserId,
  createMovie,
  deleteMovieById,
  getMovieById,
  getMovies,
  updateMovieById,
} from "../controllers/movie.controller"
import asyncMiddleware from "../middlewares/async"

const router: Router = express.Router()

// router.param("id", asyncMiddleware(checkUserId))

router.post("/", asyncMiddleware(createMovie))
router.get("/", asyncMiddleware(getMovies))
router.get("/:id", asyncMiddleware(getMovieById))
router.put("/:id", asyncMiddleware(updateMovieById))
router.delete("/:id", asyncMiddleware(deleteMovieById))

export default router
