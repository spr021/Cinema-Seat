import { afterAll, beforeAll, describe, expect, it } from "vitest"
import Seat from "../models/seat.model"
import { sweepExpiredHolds } from "../jobs/hold-sweep"
import { createTestUser, startTestEnv, stopTestEnv, TestUser } from "./helpers"

let baseUrl: string
let alice: TestUser
let bob: TestUser
let showId: string
let seats: { _id: string; row: string; seatNumber: string; isAvailable: boolean }[]

async function holdSeats(
  user: TestUser,
  seatIds: string[]
): Promise<Response> {
  return fetch(`${baseUrl}/seat/hold`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user.token}`,
    },
    body: JSON.stringify({ seatIds }),
  })
}

beforeAll(async () => {
  baseUrl = await startTestEnv()
  alice = await createTestUser(baseUrl, "alice@example.com")
  bob = await createTestUser(baseUrl, "bob@example.com")

  const movieResponse = await fetch(`${baseUrl}/movie`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "Hold Movie",
      img: "https://example.com/p.jpg",
      genre: "Drama",
      duration: 90,
      year: "2026",
    }),
  })
  const movie = await movieResponse.json()
  const showResponse = await fetch(`${baseUrl}/show/create/${movie._id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: "2026-07-01T18:00:00.000Z",
      hall_id: "1",
      movie_id: movie._id,
    }),
  })
  showId = (await showResponse.json())._id
  const show = await (await fetch(`${baseUrl}/show/${showId}`)).json()
  seats = show.seats
})

afterAll(async () => {
  await stopTestEnv()
})

describe("seat holds", () => {
  it("requires authentication", async () => {
    const response = await fetch(`${baseUrl}/seat/hold`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seatIds: [seats[0]._id] }),
    })
    expect(response.status).toBe(401)
  })

  it("holds free seats for the caller", async () => {
    const response = await holdSeats(alice, [seats[0]._id, seats[1]._id])
    expect(response.status).toBe(200)

    const stored = await Seat.findById(seats[0]._id)
    expect(String(stored!.holdBy)).toBe(alice.id)
    expect(stored!.holdUntil!.getTime()).toBeGreaterThan(Date.now())
  })

  it("rejects seats held by another user and holds nothing", async () => {
    // seat 0 is held by alice; bob tries [1 (also alice's), 2 (free)]
    const response = await holdSeats(bob, [seats[1]._id, seats[2]._id])
    expect(response.status).toBe(409)

    // The free seat must not have ended up held by bob
    const free = await Seat.findById(seats[2]._id)
    expect(free!.holdBy).toBeNull()
    expect(free!.holdUntil).toBeNull()
  })

  it("lets the holder re-hold and extend their own hold", async () => {
    const response = await holdSeats(alice, [seats[0]._id])
    expect(response.status).toBe(200)
  })

  it("blocks reservations for seats held by someone else", async () => {
    const response = await fetch(`${baseUrl}/reservation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bob.token}`,
      },
      body: JSON.stringify({
        show_id: showId,
        seat_ids: JSON.stringify([seats[0]._id]),
      }),
    })
    expect(response.status).toBe(409)
    expect((await response.json()).message).toContain("hold")
  })

  it("lets the holder reserve their held seats and consumes the hold", async () => {
    const response = await fetch(`${baseUrl}/reservation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${alice.token}`,
      },
      body: JSON.stringify({
        show_id: showId,
        seat_ids: JSON.stringify([seats[0]._id, seats[1]._id]),
      }),
    })
    expect(response.status).toBe(201)

    const stored = await Seat.findById(seats[0]._id)
    expect(stored!.isAvailable).toBe(false)
    expect(stored!.holdBy).toBeNull()
    expect(stored!.holdUntil).toBeNull()
  })

  it("allows re-holding after the hold expires", async () => {
    // Give bob a hold, then age it out
    await holdSeats(bob, [seats[2]._id])
    await Seat.updateOne(
      { _id: seats[2]._id },
      { holdUntil: new Date(Date.now() - 1000) }
    )

    const response = await holdSeats(alice, [seats[2]._id])
    expect(response.status).toBe(200)
    const stored = await Seat.findById(seats[2]._id)
    expect(String(stored!.holdBy)).toBe(alice.id)
  })

  it("releases only the caller's own unreserved holds", async () => {
    await holdSeats(alice, [seats[3]._id])

    // Bob cannot release alice's hold
    await fetch(`${baseUrl}/seat/release`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bob.token}`,
      },
      body: JSON.stringify({ seatIds: [seats[3]._id] }),
    })
    expect((await Seat.findById(seats[3]._id))!.holdBy).toBeTruthy()

    // Alice can
    const response = await fetch(`${baseUrl}/seat/release`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${alice.token}`,
      },
      body: JSON.stringify({ seatIds: [seats[3]._id] }),
    })
    expect(response.status).toBe(200)
    const stored = await Seat.findById(seats[3]._id)
    expect(stored!.holdBy).toBeNull()
  })

  it("sweep releases expired holds", async () => {
    await Seat.updateOne(
      { _id: seats[4]._id },
      { holdBy: bob.id, holdUntil: new Date(Date.now() - 5000) }
    )

    const modified = await sweepExpiredHolds()
    expect(modified).toBeGreaterThan(0)

    const stored = await Seat.findById(seats[4]._id)
    expect(stored!.holdBy).toBeNull()
    expect(stored!.holdUntil).toBeNull()
  })
})
