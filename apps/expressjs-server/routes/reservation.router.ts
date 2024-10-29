import express, { Router } from "express"
import {
  getReservationById,
  getReservationsByUserId,
  createReservation,
} from "../controllers/reservation.controller"

const router: Router = express.Router()

router.get("/:reservationId", getReservationById)
router.get("/list/:userId", getReservationsByUserId)
router.post("/", createReservation)

export default router
