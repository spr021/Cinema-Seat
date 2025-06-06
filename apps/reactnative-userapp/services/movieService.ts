import { Movie } from "@/types/movie" // Assuming Movie interface is defined here or will be moved

const API_BASE_URL = "http://localhost:4000"

export async function fetchAllMovies(): Promise<Movie[]> {
  const response = await fetch(`${API_BASE_URL}/movie`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()

  // Map backend data to Movie interface
  const formattedMovies: Movie[] = data.map((movie: any) => ({
    _id: movie._id,
    title: movie.title,
    img: movie.img,
    rating: movie.rating,
    year: movie.year,
    description: movie.description,
    genre: movie.genre,
    director: movie.director,
    actors: movie.actors,
    trailerUrl: movie.trailerUrl,
    duration: movie.duration,
  }))

  return formattedMovies
}

export async function fetchMovieById(movieId: string): Promise<Movie> {
  const response = await fetch(`${API_BASE_URL}/movie/${movieId}`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  return data // Assuming the backend returns data directly mappable to Movie
}
