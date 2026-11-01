import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { createTestUser, startTestEnv, stopTestEnv, TestUser } from "./helpers"

let baseUrl: string
let user: TestUser

let movieId: string
let showId: string
let secondShowId: string
let seats: { _id: string; row: string; seatNumber: string }[]

interface SeatDoc {
  _id: string
  row: string
  seatNumber: string
  isAvailable: boolean
}

async function fetchShowSeats(id: string): Promise<SeatDoc[]> {
  const response = await fetch(`${baseUrl}/show/${id}`)
  expect(response.status).toBe(200)
  const show = await response.json()
  return show.seats
}

beforeAll(async () => {
  baseUrl = await startTestEnv()
  user = await createTestUser(baseUrl, "booker@example.com")

  // Create a movie and two shows (hall 1 = 18 seats)
  const movieResponse = await fetch(`${baseUrl}/movie`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Test Movie",
      img: "https://example.com/poster.jpg",
      genre: "Action",
      duration: 120,
      year: "2026",
    }),
  })
  expect(movieResponse.status).toBe(200)
  movieId = (await movieResponse.json())._id

  const showResponse = await fetch(`${baseUrl}/show/create/${movieId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: "2026-06-01T18:00:00.000Z",
      hall_id: "1",
      movie_id: movieId,
    }),
  })
  expect(showResponse.status).toBe(200)
  showId = (await showResponse.json())._id

  const secondShowResponse = await fetch(`${baseUrl}/show/create/${movieId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: "2026-06-02T18:00:00.000Z",
      hall_id: "2",
      movie_id: movieId,
    }),
  })
  expect(secondShowResponse.status).toBe(200)
  secondShowId = (await secondShowResponse.json())._id

  seats = await fetchShowSeats(showId)
  expect(seats).toHaveLength(18)
})

afterAll(async () => {
  await stopTestEnv()
})

describe("seat reservation", () => {
  it("reserves free seats and marks them unavailable", async () => {
    const [a, b] = seats
    const response = await fetch(`${baseUrl}/seat/reserve-multiple`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seatIds: [a._id, b._id], reservedBy: user.id }),
    })
    expect(response.status).toBe(200)
    expect((await response.json()).success).toBe(true)

    const after = await fetchShowSeats(showId)
    expect(after.find((s) => s._id === a._id)!.isAvailable).toBe(false)
    expect(after.find((s) => s._id === b._id)!.isAvailable).toBe(false)
  })

  it("rejects reserving already-reserved seats with 409", async () => {
    const [a] = seats
    const response = await fetch(`${baseUrl}/seat/reserve-multiple`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seatIds: [a._id], reservedBy: user.id }),
    })
    expect(response.status).toBe(409)
  })

  it("reserves all-or-nothing when one seat is taken", async () => {
    const [taken, , free] = seats
    const response = await fetch(`${baseUrl}/seat/reserve-multiple`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seatIds: [free._id, taken._id], reservedBy: user.id }),
    })
    expect(response.status).toBe(409)

    // The free seat must not have been locked by the failed attempt
    const after = await fetchShowSeats(showId)
    expect(after.find((s) => s._id === free._id)!.isAvailable).toBe(true)
  })
})

describe("reservation flow", () => {
  it("rejects unauthenticated reservation attempts", async () => {
    const response = await fetch(`${baseUrl}/reservation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        show_id: showId,
        seat_ids: JSON.stringify([seats[3]._id]),
      }),
    })
    expect(response.status).toBe(401)
  })

  it("creates a reservation for the token user and locks the seats", async () => {
    const [ , , , c, d] = seats
    const response = await fetch(`${baseUrl}/reservation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        show_id: showId,
        seat_ids: JSON.stringify([c._id, d._id]),
      }),
    })
    expect(response.status).toBe(201)
    const reservation = await response.json()
    expect(reservation.is_paid).toBe(false)

    const after = await fetchShowSeats(showId)
    expect(after.find((s) => s._id === c._id)!.isAvailable).toBe(false)
    expect(after.find((s) => s._id === d._id)!.isAvailable).toBe(false)
  })

  it("rejects seats that belong to a different show", async () => {
    const otherShowSeats = await fetchShowSeats(secondShowId)
    const response = await fetch(`${baseUrl}/reservation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({
        show_id: showId,
        seat_ids: JSON.stringify([otherShowSeats[0]._id]),
      }),
    })
    expect(response.status).toBe(400)
  })

  it("pays a reservation, creates a ticket with hall price, and blocks double pay", async () => {
    const listResponse = await fetch(`${baseUrl}/reservation/tickets`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
    expect(listResponse.status).toBe(200)
    const reservations = await listResponse.json()
    const reservation = reservations.find(
      (r: any) => String(r.show_id?._id ?? r.show_id) === showId
    )
    expect(reservation).toBeTruthy()

    const payResponse = await fetch(
      `${baseUrl}/reservation/${reservation._id}/pay`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${user.token}` },
      }
    )
    expect(payResponse.status).toBe(200)
    const payBody = await payResponse.json()
    // Hall 1 costs 20$ per seat, reservation has 2 seats
    expect(payBody.ticket.price).toBe(40)

    const secondPay = await fetch(
      `${baseUrl}/reservation/${reservation._id}/pay`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${user.token}` },
      }
    )
    expect(secondPay.status).toBe(400)
  })

  it("lists tickets for the user and validation persists is_used", async () => {
    const admin = await createTestUser(baseUrl, "staff@example.com", true)

    const ticketsResponse = await fetch(`${baseUrl}/ticket/list`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
    expect(ticketsResponse.status).toBe(200)
    const tickets = await ticketsResponse.json()
    expect(tickets).toHaveLength(1)
    expect(tickets[0].price).toBe(40)

    const ticketId = tickets[0]._id

    const validate = await fetch(`${baseUrl}/ticket/validate/${ticketId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${admin.token}` },
    })
    expect(validate.status).toBe(200)

    // Second validation must fail, which only works if is_used persisted
    const revalidate = await fetch(`${baseUrl}/ticket/validate/${ticketId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${admin.token}` },
    })
    expect(revalidate.status).toBe(400)
  })

  it("blocks non-admins from validating tickets", async () => {
    const admin = await createTestUser(baseUrl, "staff2@example.com", true)
    const someone = await createTestUser(baseUrl, "nonstaff@example.com")

    // Create + pay another reservation to get a fresh ticket
    const seat = (await fetchShowSeats(showId)).find((s) => s.isAvailable)!
    const reservationResponse = await fetch(`${baseUrl}/reservation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${someone.token}`,
      },
      body: JSON.stringify({
        show_id: showId,
        seat_ids: JSON.stringify([seat._id]),
      }),
    })
    const reservation = await reservationResponse.json()

    await fetch(`${baseUrl}/reservation/${reservation._id}/pay`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${someone.token}` },
    })

    const ticketsResponse = await fetch(`${baseUrl}/ticket/list`, {
      headers: { Authorization: `Bearer ${someone.token}` },
    })
    const tickets = await ticketsResponse.json()
    const ticketId = tickets[0]._id

    const forbidden = await fetch(`${baseUrl}/ticket/validate/${ticketId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${someone.token}` },
    })
    expect(forbidden.status).toBe(403)

    const allowed = await fetch(`${baseUrl}/ticket/validate/${ticketId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${admin.token}` },
    })
    expect(allowed.status).toBe(200)
  })
})
