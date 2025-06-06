import { useState, useEffect } from "react"
import { fetchMovieById } from "@/services/movieService"
import { Movie } from "@/types/movie"

interface UseMovieDetailResult {
  movie: Movie | null
  isLoading: boolean
  error: string | null
}

export function useMovieDetail(
  movieId: string | string[]
): UseMovieDetailResult {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const movieIdString = Array.isArray(movieId) ? movieId[0] : movieId

  useEffect(() => {
    async function loadMovieDetails() {
      if (!movieIdString) return

      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchMovieById(movieIdString)
        setMovie(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch movie details")
      } finally {
        setIsLoading(false)
      }
    }

    loadMovieDetails()
  }, [movieIdString])

  return { movie, isLoading, error }
}
