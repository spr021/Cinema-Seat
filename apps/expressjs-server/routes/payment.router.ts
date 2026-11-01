import express, { Router } from "express"
import {
  createCheckoutSession,
  handleReturn,
  verifyPayment,
  webhookHandler,
} from "../controllers/payment.controller"
import asyncMiddleware from "../middlewares/async"
import { authenticateToken } from "../middlewares/auth.middleware"

const router: Router = express.Router()

// Stripe posts signed events here; the route must read the raw body
router.post("/webhook", asyncMiddleware(webhookHandler))
router.get("/return", asyncMiddleware(handleReturn))
router.post(
  "/create-checkout/:reservationId",
  authenticateToken,
  asyncMiddleware(createCheckoutSession)
)
router.get(
  "/verify/:reservationId",
  authenticateToken,
  asyncMiddleware(verifyPayment)
)

export default router
