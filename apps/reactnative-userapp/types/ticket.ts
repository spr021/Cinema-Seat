import { Movie } from "./movie"
import { Reservation } from "./reservation"
import { Show } from "./show"
import { User } from "./user"

export interface SeatDetails {
  _id: string
  seatNumber: string
  row: string
}

export interface Ticket {
  _id: string
  user_id: User // Populated user object
  show_id: Show // Populated show object
  seat_ids: SeatDetails[] // Populated seat objects
  reservation_id: Reservation // ID of the linked reservation
  purchase_date: string // Date string
  price: number
  createdAt: string
  updatedAt: string
  __v: number
}
