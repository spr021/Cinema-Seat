import { ScrollView, View, ActivityIndicator, Text } from "react-native"
import MovieSlider from "@/components/MovieSlider"
import { useMovies } from "@/hooks/useMovies"

export default function HomeScreen() {
  const { movies, isLoading, error } = useMovies()

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2">Loading movies...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-red-500">Error: {error}</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 pt-10 mb-24">
      <Text className="ml-2.5 mb-2.5 mt-5 text-2xl font-bold">Coming Soon</Text>
      <MovieSlider movies={movies} size="big" />

      <Text className="ml-2.5 mb-2.5 mt-5 text-2xl font-bold">Now Playing</Text>
      <MovieSlider movies={movies} size="small" />

      <Text className="ml-2.5 mb-2.5 mt-5 text-2xl font-bold">Popular</Text>
      <MovieSlider movies={movies} size="small" />
    </ScrollView>
  )
}
