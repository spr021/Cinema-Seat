import { Request, Response } from "express"
import Stripe from "stripe"
import type { Event as StripeEvent } from "stripe"
import Reservation from "../models/reservation.model"
import {
  getStripe,
  isStripeEnabled,
  markReservationPaidAndCreateTicket,
  pricePerSeatCents,
} from "../services/payments"

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    roles: string[]
  }
}

// The checkout return page lives on this server; browsers reach it on localhost
const API_BASE_URL = `http://localhost:${process.env.PORT ?? 4000}`

// @desc    Create a Stripe Checkout session for a reservation
// @route   POST /payments/create-checkout/:reservationId
// @access  Private
const createCheckoutSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "User not authenticated." })
  }
  const stripe = getStripe()
  if (!stripe) {
    // Graceful degradation: no key configured -> client uses the mock flow
    return res.status(200).json({ stripeEnabled: false })
  }

  const reservation = await Reservation.findById(req.params.reservationId)
  if (!reservation) {
    return res.status(404).json({ message: "Reservation not found." })
  }
  if (String(reservation.user_id) !== req.user.id) {
    return res.status(403).json({ message: "Not your reservation." })
  }
  if (reservation.is_paid) {
    return res.status(400).json({ message: "Reservation is already paid." })
  }

  await reservation.populate("show_id")
  const show = reservation.show_id as { hall_id?: string } | null
  const unitAmount = pricePerSeatCents(show)
  const seatCount = reservation.seat_ids.length

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: String(reservation._id),
    metadata: { reservationId: String(reservation._id) },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: unitAmount * seatCount,
          product_data: {
            name: `Cinema ticket${seatCount > 1 ? "s" : ""} (${seatCount} seat${seatCount > 1 ? "s" : ""})`,
          },
        },
      },
    ],
    success_url: `${API_BASE_URL}/payments/return?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${API_BASE_URL}/payments/return?cancelled=1`,
  })

  reservation.checkout_session_id = session.id
  await reservation.save()

  res.status(200).json({ stripeEnabled: true, url: session.url })
}

// @desc    Stripe webhook: checkout.session.completed marks the reservation paid
// @route   POST /payments/webhook
// @access  Public (signature verified)
const webhookHandler = async (req: Request, res: Response) => {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) {
    return res.status(503).json({ message: "Stripe is not configured." })
  }

  const signature = req.headers["stripe-signature"] as string | undefined
  if (!signature) {
    return res.status(400).json({ message: "Missing stripe-signature header." })
  }

  let event: StripeEvent
  try {
    // req.body is the raw Buffer (see express.raw in app.ts)
    event = stripe.webhooks.constructEvent(req.body, signature, secret)
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Webhook signature verification failed` })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      client_reference_id?: string | null
      metadata?: Record<string, string> | null
    }
    const reservationId = session.metadata?.reservationId ?? session.client_reference_id
    if (reservationId) {
      await markReservationPaidAndCreateTicket(reservationId)
    }
  }

  res.status(200).json({ received: true })
}

// @desc    Checkout return page. Also acts as a webhook substitute for local
//          development where `stripe listen` is not running.
// @route   GET /payments/return
// @access  Public
const handleReturn = async (req: Request, res: Response) => {
  const appUrl = process.env.APP_URL ?? "http://localhost:8081"
  const html = (message: string) =>
    res
      .status(200)
      .send(
        `<html><body style="font-family:sans-serif;text-align:center;padding-top:80px"><h1>${message}</h1><p><a href="${appUrl}">Back to the app</a></p></body></html>`
      )

  if (req.query.cancelled) {
    return html("Payment cancelled")
  }

  const stripe = getStripe()
  const sessionId = req.query.session_id as string | undefined
  if (!stripe || !sessionId) {
    return html("Payment status unknown")
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const reservationId =
      session.metadata?.reservationId ?? session.client_reference_id
    if (session.payment_status === "paid" && reservationId) {
      await markReservationPaidAndCreateTicket(reservationId)
      return html("Payment successful 🎉")
    }
    return html("Payment not completed yet")
  } catch {
    return html("Could not verify the payment")
  }
}

// @desc    Check (and finalize) the payment for a reservation; called when
//          the user returns from the Stripe browser session
// @route   GET /payments/verify/:reservationId
// @access  Private
const verifyPayment = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "User not authenticated." })
  }

  const reservation = await Reservation.findById(req.params.reservationId)
  if (!reservation) {
    return res.status(404).json({ message: "Reservation not found." })
  }
  if (String(reservation.user_id) !== req.user.id) {
    return res.status(403).json({ message: "Not your reservation." })
  }

  if (!reservation.is_paid && reservation.checkout_session_id) {
    const stripe = getStripe()
    if (stripe) {
      const session = await stripe.checkout.sessions.retrieve(
        reservation.checkout_session_id
      )
      if (session.payment_status === "paid") {
        await markReservationPaidAndCreateTicket(String(reservation._id))
      }
    }
  }

  const updated = await Reservation.findById(reservation._id)
  res.status(200).json({ is_paid: updated?.is_paid ?? false })
}

export { createCheckoutSession, webhookHandler, handleReturn, verifyPayment }
