export interface Movie {
  _id: string
  title: string
  summary: string
  year: string
  genre: string
  director: string
  actors: string[]
  img: string
  trailerUrl: string
  duration: number // in minutes
  rating: number // IMDb rating or similar
}
