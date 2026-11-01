import crypto from "crypto"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import Reservation from "../models/reservation.model"
import Ticket from "../models/ticket.model"
import { createTestUser, startTestEnv, stopTestEnv, TestUser } from "./helpers"

// Stripe is in test mode only: no real money moves anywhere in this suite.
const WEBHOOK_SECRET = "whsec_test_secret"

// Stripe's signature header scheme: t=<unix ts>,v1=HMAC_SHA256(secret, `${t}.${payload}`)
function stripeSignatureHeader(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex")
  return `t=${timestamp},v1=${signature}`
}

function checkoutCompletedEvent(reservationId: string): string {
  return JSON.stringify({
    id: "evt_test_1",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_1",
        object: "checkout.session",
        payment_status: "paid",
        client_reference_id: reservationId,
        metadata: { reservationId },
      },
    },
  })
}

async function postWebhook(payload: string, secret: string) {
  return fetch(`${baseUrl}/payments/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": stripeSignatureHeader(payload, secret),
    },
    body: payload,
  })
}

let baseUrl: string
let user: TestUser
let reservationId: string
let showId: string

beforeAll(async () => {
  process.env.STRIPE_SECRET_KEY = "sk_test_dummy"
  process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET
  baseUrl = await startTestEnv()
  user = await createTestUser(baseUrl, "payer@example.com")

  const movieResponse = await fetch(`${baseUrl}/movie`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Stripe Movie",
      img: "https://example.com/p.jpg",
      genre: "Action",
      duration: 100,
      year: "2026",
    }),
  })
  const movie = await movieResponse.json()
  const showResponse = await fetch(`${baseUrl}/show/create/${movie._id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: "2026-08-01T18:00:00.000Z",
      hall_id: "1",
      movie_id: movie._id,
    }),
  })
  showId = (await showResponse.json())._id
  const show = await (await fetch(`${baseUrl}/show/${showId}`)).json()

  const reservationResponse = await fetch(`${baseUrl}/reservation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({
      show_id: showId,
      seat_ids: JSON.stringify([show.seats[0]._id, show.seats[1]._id]),
    }),
  })
  reservationId = (await reservationResponse.json())._id
})

afterAll(async () => {
  delete process.env.STRIPE_SECRET_KEY
  delete process.env.STRIPE_WEBHOOK_SECRET
  await stopTestEnv()
})

describe("stripe webhook", () => {
  it("rejects unsigned or invalidly signed payloads", async () => {
    const payload = JSON.stringify({ type: "checkout.session.completed" })

    const unsigned = await fetch(`${baseUrl}/payments/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    })
    expect(unsigned.status).toBe(400)

    const forged = await postWebhook(payload, "whsec_wrong_secret")
    expect(forged.status).toBe(400)
  })

  it("marks the reservation paid and creates a ticket on a valid event", async () => {
    const payload = checkoutCompletedEvent(reservationId)
    const response = await postWebhook(payload, WEBHOOK_SECRET)
    expect(response.status).toBe(200)
    expect((await response.json()).received).toBe(true)

    const reservation = await Reservation.findById(reservationId)
    expect(reservation!.is_paid).toBe(true)
    const ticket = await Ticket.findOne({ reservation_id: reservationId })
    expect(ticket).not.toBeNull()
    // Hall 1 costs 20$ per seat, 2 seats
    expect(ticket!.price).toBe(40)
  })

  it("is idempotent: replaying the event does not duplicate tickets", async () => {
    const payload = checkoutCompletedEvent(reservationId)
    await postWebhook(payload, WEBHOOK_SECRET)

    const tickets = await Ticket.find({ reservation_id: reservationId })
    expect(tickets).toHaveLength(1)
  })

  it("reports reservation payment status via verify endpoint", async () => {
    const response = await fetch(
      `${baseUrl}/payments/verify/${reservationId}`,
      {
        headers: { Authorization: `Bearer ${user.token}` },
      }
    )
    expect(response.status).toBe(200)
    expect((await response.json()).is_paid).toBe(true)
  })
})
