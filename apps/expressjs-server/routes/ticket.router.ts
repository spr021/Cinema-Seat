import express, { Router } from "express"
import {
  getTicketsByUserId,
  validateTicket,
  getStats,
} from "../controllers/ticket.controller"
import asyncMiddleware from "../middlewares/async"
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware"

const router: Router = express.Router()

router.get("/list", authenticateToken, asyncMiddleware(getTicketsByUserId))
// Validating (burning) a ticket is a staff action
router.post(
  "/validate/:ticketId",
  authenticateToken,
  authorizeRoles(["admin"]),
  asyncMiddleware(validateTicket)
)
router.get(
  "/stats",
  authenticateToken,
  authorizeRoles(["admin"]),
  asyncMiddleware(getStats)
)

export default router
