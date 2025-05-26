import express, { Router } from "express"
import {
  getReservationById,
  getReservationsByUserId,
  createReservation,
} from "../controllers/reservation.controller"
import asyncMiddleware from "../middlewares/async"

const router: Router = express.Router()

router.get("/:reservationId", asyncMiddleware(getReservationById))
router.get("/list/:userId", asyncMiddleware(getReservationsByUserId))
//to do  asyncMiddleware
router.post("/", createReservation)

export default router
