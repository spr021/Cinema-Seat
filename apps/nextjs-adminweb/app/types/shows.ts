export interface Show {
  id: string
  title: string
  start: string
  end: string
  movieId: string
  hallId: string
  price: number
}

export interface Movie {
  id: string
  title: string
  duration: number // in minutes
}

export interface Hall {
  id: string
  name: string
  capacity: number
} 