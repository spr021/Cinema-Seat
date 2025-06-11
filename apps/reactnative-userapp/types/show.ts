import { Movie } from "./movie"

export interface Show {
  _id: string
  date: string
  seats: string[] // Array of seat IDs
  movie_id: Movie // Populated movie object
  hall_id: string
}
