import express, { Router } from "express"
import {
  getSeatById,
  getSeatsByShowId,
  updateSeatById,
} from "../controllers/seat.controller"

const router: Router = express.Router()

router.get("/:seatId", getSeatById)
router.get("/list/:showId", getSeatsByShowId)
router.put("/:seatId", updateSeatById)

export default router
