import express, { Router } from "express"
import {
  getSeatById,
  getSeatsByShowId,
  updateSeatById,
  reserveMultipleSeats,
} from "../controllers/seat.controller"
import asyncMiddleware from "../middlewares/async"

const router: Router = express.Router()

router.get("/:seatId", asyncMiddleware(getSeatById))
router.get("/list/:showId", asyncMiddleware(getSeatsByShowId))
router.put("/reserve-multiple", asyncMiddleware(reserveMultipleSeats))
router.put("/:seatId", asyncMiddleware(updateSeatById))

export default router
