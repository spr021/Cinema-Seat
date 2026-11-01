import { AddressInfo } from "net"
import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import app from "../app"
import User from "../models/user.model"

let mongoServer: MongoMemoryServer
let server: ReturnType<typeof app.listen>

/**
 * Boots an in-memory MongoDB and the express app on an ephemeral port.
 * Returns the base URL to fetch against.
 */
export async function startTestEnv(): Promise<string> {
  process.env.JWT_SECRET_KEY = "test-secret"
  // Email delivery is a side effect we don't want in tests
  process.env.EMAILS_DISABLED = "true"
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
  server = app.listen(0)
  const port = (server.address() as AddressInfo).port
  return `http://127.0.0.1:${port}`
}

export async function stopTestEnv() {
  await mongoose.disconnect()
  await mongoServer.stop()
  server.close()
}

export interface TestUser {
  token: string
  id: string
}

/** Registers a user; promotes to admin when requested; logs in for a token. */
export async function createTestUser(
  baseUrl: string,
  email: string,
  isAdmin = false
): Promise<TestUser> {
  const registerResponse = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Test User",
      email,
      password: "password123",
    }),
  })
  if (!registerResponse.ok) {
    throw new Error(`register failed: ${registerResponse.status}`)
  }
  const registered = await registerResponse.json()

  if (isAdmin) {
    await User.findByIdAndUpdate(registered.user._id, {
      roles: ["user", "admin"],
    })
  }

  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123" }),
  })
  if (!loginResponse.ok) {
    throw new Error(`login failed: ${loginResponse.status}`)
  }
  const session = await loginResponse.json()
  return { token: session.token, id: session.user._id }
}
