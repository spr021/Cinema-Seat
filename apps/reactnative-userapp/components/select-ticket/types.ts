export interface Seat {
  _id: string
  seatNumber: string
  row: string
  isAvailable: boolean
  reservedBy?: string
}

export interface Show {
  _id: string
  date: string // This string will contain both date and time
  seats: Seat[]
  createdAt: string
  updatedAt: string
}
