import { useState, useEffect } from "react"
import { fetchAllMovies } from "@/services/movieService"
import { Movie } from "@/types/movie"

interface UseMoviesResult {
  movies: Movie[]
  isLoading: boolean
  error: string | null
}

export function useMovies(): UseMoviesResult {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMovies() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchAllMovies()
        setMovies(data)
      } catch (err: any) {
        setError(err.message || "Failed to fetch movies.")
      } finally {
        setIsLoading(false)
      }
    }

    loadMovies()
  }, [])

  return { movies, isLoading, error }
}
