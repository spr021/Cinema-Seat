import express, { Router } from "express"
import {
  getSeatById,
  getSeatsByShowId,
  updateSeatById,
  reserveMultipleSeats,
  holdSeats,
  releaseHeldSeats,
} from "../controllers/seat.controller"
import asyncMiddleware from "../middlewares/async"
import { authenticateToken } from "../middlewares/auth.middleware"

const router: Router = express.Router()

router.get("/:seatId", asyncMiddleware(getSeatById))
router.get("/list/:showId", asyncMiddleware(getSeatsByShowId))
router.put("/reserve-multiple", asyncMiddleware(reserveMultipleSeats))
// Holds require a user so the hold always has an owner
router.post("/hold", authenticateToken, asyncMiddleware(holdSeats))
router.post("/release", authenticateToken, asyncMiddleware(releaseHeldSeats))
router.put("/:seatId", asyncMiddleware(updateSeatById))

export default router
