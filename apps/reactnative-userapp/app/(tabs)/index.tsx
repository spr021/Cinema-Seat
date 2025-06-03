import { ScrollView, View, ActivityIndicator } from "react-native"
import MovieSlider from "@/components/MovieSlider"
import { ThemedText } from "@/components/ThemedText"
import { useEffect, useState } from "react"
import { Movie } from "../../types/movie" // Import the common Movie interface

export default function HomeScreen() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch("http://localhost:4000/movie") // Corrected API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const formattedMovies: Movie[] = data.map((movie: any) => ({
          _id: movie._id,
          title: movie.title,
          img: movie.img, // Use posterUrl from backend
          rating: movie.rating,
          year: movie.year, // Use releaseDate from backend
          description: movie.description,
          genre: movie.genre,
          director: movie.director,
          actors: movie.actors,
          trailerUrl: movie.trailerUrl,
          duration: movie.duration,
        }))
        setMovies(formattedMovies)
      } catch (error: any) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovies()
  }, [])

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <ThemedText className="mt-2">Loading movies...</ThemedText>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <ThemedText type="subtitle" className="text-red-500">
          Error: {error}
        </ThemedText>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 pt-10">
      <ThemedText type="title" className="ml-2.5 mb-2.5 mt-5">
        Coming Soon
      </ThemedText>
      <MovieSlider movies={movies} size="big" />

      <ThemedText type="title" className="ml-2.5 mb-2.5 mt-5">
        Now Playing
      </ThemedText>
      <MovieSlider movies={movies} size="small" />

      <ThemedText type="title" className="ml-2.5 mb-2.5 mt-5">
        Popular
      </ThemedText>
      <MovieSlider movies={movies} size="small" />
    </ScrollView>
  )
}
