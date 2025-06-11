import { User } from "./user"

export interface Reservation {
  _id: string
  user_id: User // User ID, not populated
  seat_ids: string[] // Array of seat IDs
  show_id: string // Show ID, not populated
  is_paid: boolean
  createdAt: string
  updatedAt: string
  __v: number
}
