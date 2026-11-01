import { afterAll, beforeAll, describe, expect, it } from "vitest"
import User from "../models/user.model"
import { createTestUser, startTestEnv, stopTestEnv } from "./helpers"

let baseUrl: string

beforeAll(async () => {
  baseUrl = await startTestEnv()
})

afterAll(async () => {
  await stopTestEnv()
})

describe("auth", () => {
  it("hashes the password before saving", async () => {
    const email = "hash@example.com"
    await User.create({
      name: "Hash Test",
      email,
      password: "password123",
    })

    const user = await User.findOne({ email }).select("+password")
    expect(user).not.toBeNull()
    expect(user!.password).not.toBe("password123")
    expect(user!.password.startsWith("$2")).toBe(true)
  })

  it("registers a user and never leaks the password hash", async () => {
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Leak Test",
        email: "leak@example.com",
        password: "password123",
      }),
    })

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.user._id).toBeTruthy()
    expect(body.user.email).toBe("leak@example.com")
    expect(body.user.roles).toEqual(["user"])
    expect(body.token).toBeTruthy()
    // The response must not contain the (hashed) password anywhere
    expect(JSON.stringify(body)).not.toContain("$2")
  })

  it("rejects duplicate emails with 409", async () => {
    const payload = {
      name: "Dup Test",
      email: "dup@example.com",
      password: "password123",
    }
    await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const response = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    expect(response.status).toBe(409)
  })

  it("rejects invalid emails with 400", async () => {
    const response = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Invalid Email",
        email: "not-an-email",
        password: "password123",
      }),
    })
    expect(response.status).toBe(400)
  })

  it("logs in and returns the user with _id", async () => {
    await createTestUser(baseUrl, "login@example.com")

    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "login@example.com",
        password: "password123",
      }),
    })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.user._id).toBeTruthy()
    expect(body.user.roles).toEqual(["user"])
    expect(body.token).toBeTruthy()
  })

  it("rejects wrong passwords with 401", async () => {
    await createTestUser(baseUrl, "wrongpw@example.com")

    const response = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "wrongpw@example.com",
        password: "incorrect-password",
      }),
    })
    expect(response.status).toBe(401)
  })

  it("lets users delete themselves but not others", async () => {
    const victim = await createTestUser(baseUrl, "victim@example.com")
    const attacker = await createTestUser(baseUrl, "attacker@example.com")

    const forbidden = await fetch(`${baseUrl}/auth/${victim.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${attacker.token}` },
    })
    expect(forbidden.status).toBe(403)

    const own = await fetch(`${baseUrl}/auth/${attacker.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${attacker.token}` },
    })
    expect(own.status).toBe(200)
  })

  it("prevents regular users from promoting themselves via PUT /auth/:id", async () => {
    const user = await createTestUser(baseUrl, "selfpromote@example.com")

    const response = await fetch(`${baseUrl}/auth/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ roles: ["user", "admin"] }),
    })
    expect(response.status).toBe(200)

    const stored = await User.findById(user.id)
    expect(stored!.roles).toEqual(["user"])
  })

  it("allows admins to update other users", async () => {
    const admin = await createTestUser(baseUrl, "admin@example.com", true)
    const target = await createTestUser(baseUrl, "target@example.com")

    const response = await fetch(`${baseUrl}/auth/${target.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${admin.token}`,
      },
      body: JSON.stringify({ name: "Renamed Target" }),
    })
    expect(response.status).toBe(200)

    const stored = await User.findById(target.id)
    expect(stored!.name).toBe("Renamed Target")
  })
})
