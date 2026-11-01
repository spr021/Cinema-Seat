import express, { Router } from "express"
import {
  getReservationById,
  getReservationsByUserId,
  createReservation,
  markReservationAsPaid,
} from "../controllers/reservation.controller"
import asyncMiddleware from "../middlewares/async"
import { authenticateToken } from "../middlewares/auth.middleware"

const router: Router = express.Router()

router.get(
  "/tickets",
  authenticateToken,
  asyncMiddleware(getReservationsByUserId)
)
router.get(
  "/:reservationId",
  authenticateToken,
  asyncMiddleware(getReservationById)
)
// Creating a reservation requires a logged-in user; the reservation belongs
// to whoever the token belongs to
router.post("/", authenticateToken, asyncMiddleware(createReservation))

router.put(
  "/:reservationId/pay",
  authenticateToken,
  asyncMiddleware(markReservationAsPaid)
)

export default router
