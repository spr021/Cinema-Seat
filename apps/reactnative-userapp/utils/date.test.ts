import { beforeAll, describe, expect, it } from "vitest"
import { getFormattedDate, getFormattedTime } from "./date"

// Pin the timezone so toLocaleTimeString is deterministic across machines
beforeAll(() => {
  process.env.TZ = "UTC"
})

describe("getFormattedDate", () => {
  it("extracts the UTC YYYY-MM-DD part of an ISO string", () => {
    expect(getFormattedDate("2026-06-01T18:00:00.000Z")).toBe("2026-06-01")
    expect(getFormattedDate("2026-12-31T23:59:59.000Z")).toBe("2026-12-31")
  })
})

describe("getFormattedTime", () => {
  it("formats the time as a 12-hour en-US string", () => {
    expect(getFormattedTime("2026-06-01T18:30:00.000Z")).toBe("06:30 PM")
    expect(getFormattedTime("2026-06-01T09:05:00.000Z")).toBe("09:05 AM")
  })
})
