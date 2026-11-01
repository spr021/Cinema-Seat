import { Document, Types } from "mongoose"

export interface SeatLike extends Document {
  isAvailable: boolean
  reservedBy?: Types.ObjectId | null
  holdBy?: Types.ObjectId | null
  holdUntil?: Date | null
  row: string
  seatNumber: string
}

export const HOLD_DURATION_MS = 10 * 60 * 1000 // 10 minutes

/**
 * A seat is bookable by `userId` when it is not reserved and either not held,
 * its hold has expired, or the hold belongs to that same user.
 */
export function isBookableBy(seat: SeatLike, userId?: string | null): boolean {
  if (!seat.isAvailable) return false
  if (!seat.holdUntil || !seat.holdBy) return true
  if (seat.holdUntil.getTime() <= Date.now()) return true
  return Boolean(userId) && String(seat.holdBy) === String(userId)
}

/** True when the seat is currently held by someone other than userId. */
export function isHeldByOther(seat: SeatLike, userId?: string | null): boolean {
  return (
    Boolean(seat.holdBy) &&
    Boolean(seat.holdUntil) &&
    seat.holdUntil!.getTime() > Date.now() &&
    String(seat.holdBy) !== String(userId)
  )
}
