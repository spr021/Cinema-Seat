import express, { Router } from "express"
import {
  createShows,
  getShowById,
  getShowsByMovieId,
  updateShowById,
  deleteShowById,
  deleteAllShowsByMovieId,
  getAllShows,
} from "../controllers/show.controller"
import asyncMiddleware from "../middlewares/async"

const router: Router = express.Router()
router.post("/create/:movieId", asyncMiddleware(createShows))
router.get("/list", asyncMiddleware(getAllShows))
router.get("/:showId", asyncMiddleware(getShowById))
router.get("/list/:movieId", asyncMiddleware(getShowsByMovieId))
router.delete("/:showId", asyncMiddleware(deleteShowById))
router.put("/:showId", asyncMiddleware(updateShowById))
router.delete("/list/:movieId", asyncMiddleware(deleteAllShowsByMovieId))

export default router
