import Seat from "../models/seat.model"

const SWEEP_INTERVAL_MS = 60 * 1000 // every minute

/**
 * Releases expired seat holds. Runs on an interval; a TTL index alone would
 * not work here because we need to clear holdBy/holdUntil, not delete the seat.
 */
export async function sweepExpiredHolds(): Promise<number> {
  const result = await Seat.updateMany(
    { holdUntil: { $lte: new Date() }, reservedBy: null },
    { holdBy: null, holdUntil: null }
  )
  return result.modifiedCount ?? 0
}

export function startHoldSweep() {
  const timer = setInterval(() => {
    sweepExpiredHolds().catch((error) =>
      console.error("Hold sweep failed:", error)
    )
  }, SWEEP_INTERVAL_MS)
  // Don't keep the node process alive just for the sweep
  timer.unref()
  return timer
}
