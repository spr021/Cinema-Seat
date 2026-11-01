import Seat from "../models/seat.model"
import { broadcastSeatsForSeatIds } from "../services/realtime"

const SWEEP_INTERVAL_MS = 60 * 1000 // every minute

/**
 * Releases expired seat holds. Runs on an interval; a TTL index alone would
 * not work here because we need to clear holdBy/holdUntil, not delete the seat.
 */
export async function sweepExpiredHolds(): Promise<number> {
  const expired = await Seat.find({
    holdUntil: { $lte: new Date() },
    reservedBy: null,
  }).select("_id")

  if (expired.length === 0) return 0

  const result = await Seat.updateMany(
    { _id: { $in: expired.map((s) => s._id) } },
    { holdBy: null, holdUntil: null }
  )

  // Let everyone watching those shows see the seats open up again
  await broadcastSeatsForSeatIds(expired.map((s) => s._id))
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
