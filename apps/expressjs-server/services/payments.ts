import Stripe from "stripe"
import Reservation from "../models/reservation.model"
import Ticket from "../models/ticket.model"
import { layout1, layout2 } from "../constant/seat.layout"
import sendEmail from "../utils/email"

let stripeClient: Stripe | null = null

/** Stripe is optional; without a key the app falls back to mock payments. */
export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripeClient
}

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

/** Price per seat in cents, from the hall layout (e.g. "20$" -> 2000). */
export function pricePerSeatCents(show: { hall_id?: string } | null): number {
  const hallLayout = show?.hall_id === "1" ? layout1 : layout2
  return (parseInt(hallLayout.price, 10) || 0) * 100
}

/**
 * Marks a reservation paid and creates its ticket. Shared by the mock pay
 * endpoint, the Stripe webhook, and the checkout return URL.
 * Returns null when the reservation does not exist.
 * Throws nothing; duplicate payments are idempotent (returns existing state).
 */
export async function markReservationPaidAndCreateTicket(
  reservationId: string
): Promise<{ reservation: typeof Reservation.prototype; ticket: unknown } | null> {
  const reservation = await Reservation.findById(reservationId)
    .populate({ path: "user_id", select: "email name" })
    .populate({
      path: "show_id",
      populate: { path: "movie_id", select: "title" },
    })
  if (!reservation) return null

  if (reservation.is_paid) {
    // Already paid: idempotent success
    const existingTicket = await Ticket.findOne({
      reservation_id: reservation._id,
    })
    return { reservation, ticket: existingTicket }
  }

  reservation.is_paid = true
  await reservation.save()

  const show = reservation.show_id as {
    hall_id?: string
    date?: string
    movie_id?: { title?: string } | null
  } | null
  const totalPrice =
    reservation.seat_ids.length * (pricePerSeatCents(show) / 100)

  const ticket = await Ticket.create({
    user_id: reservation.user_id,
    show_id: reservation.show_id,
    seat_ids: reservation.seat_ids,
    reservation_id: reservation._id,
    price: totalPrice,
    purchase_date: new Date(),
  })

  // Fire-and-forget receipt email: a broken SMTP server can never block a booking
  const user = reservation.user_id as { email?: string; name?: string } | null
  if (user?.email) {
    sendEmail({
      email: user.email,
      subject: "Your Cinema Seat tickets 🎟️",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2>Your tickets are booked!</h2>
          <p>Hi ${user.name ?? "there"},</p>
          <p><strong>${show?.movie_id?.title ?? "The movie"}</strong>${show?.date ? ` on ${new Date(show.date).toLocaleString()}` : ""}</p>
          <p>Seats: <strong>${reservation.seat_ids.length}</strong> · Total paid: <strong>$${totalPrice}</strong></p>
          <p>Show the QR code from My Tickets at the entrance.</p>
          <p style="color:#6b7280;font-size:13px">Enjoy the movie!</p>
        </div>`,
    })
  }

  return { reservation, ticket }
}
