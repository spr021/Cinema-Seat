import express, { Router } from "express"
import {
  createShows,
  getShowById,
  getShowsByMovieId,
  updateShowById,
  deleteShowById,
  deleteAllShowsByMovieId,
} from "../controllers/show.controller"

const router: Router = express.Router()
router.post("/create/:movieId", createShows)
router.get("/:showId", getShowById)
router.get("/list/:movieId", getShowsByMovieId)
router.put("/:showId", updateShowById)
router.delete("/:showId", deleteShowById)
router.delete("/list/:movieId", deleteAllShowsByMovieId)

export default router
