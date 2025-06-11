import express, { Router } from "express"
import {
  getTicketsByUserId,
  validateTicket,
} from "../controllers/ticket.controller"
import asyncMiddleware from "../middlewares/async"
import { authenticateToken } from "../middlewares/auth.middleware"

const router: Router = express.Router()

router.get("/list", authenticateToken, asyncMiddleware(getTicketsByUserId))
router.post("/validate/:ticketId", asyncMiddleware(validateTicket))

export default router
