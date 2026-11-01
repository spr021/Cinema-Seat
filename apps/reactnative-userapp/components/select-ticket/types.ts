export interface Seat {
  _id: string
  seatNumber: string
  row: string
  isAvailable: boolean
  reservedBy?: string
  // Temporary hold while another user is on the payment screen
  holdBy?: string | null
  holdUntil?: string | null
}

export interface Show {
  _id: string
  date: string // This string will contain both date and time
  seats: Seat[]
  createdAt: string
  updatedAt: string
}
