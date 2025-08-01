import React from "react"
import { useLocalSearchParams } from "expo-router"
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native"
import { useRouter } from "expo-router"
import {
  StarIcon,
  CalendarDaysIcon,
  ClockIcon,
  FilmIcon,
  HeartIcon,
} from "lucide-react-native"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useWishlist } from "@/hooks/useWishlist"
import { useMovieDetail } from "@/hooks/useMovieDetail"

function MovieDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { toggleLike, isMovieInWishlist } = useWishlist()
  const { movie, isLoading, error } = useMovieDetail(id)

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-base">Loading movie details...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 text-base">Error: {error}</Text>
      </View>
    )
  }

  if (!movie) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-base">No movie found.</Text>
      </View>
    )
  }

  const isInWishlist = movie ? isMovieInWishlist(movie._id) : false

  const handleWishlistToggle = () => {
    if (!movie) return
    toggleLike(movie)
  }

  const handleBuyTicket = () => {
    router.push(`/movie/select-ticket/${id}`)
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 pb-20">
        <View className="relative">
          <Image
            source={{ uri: movie.img }}
            className="w-full h-[400px] object-cover"
          />
          <TouchableOpacity
            onPress={handleWishlistToggle}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full"
          >
            <HeartIcon
              size={28}
              color={isInWishlist ? "red" : "white"}
              fill={isInWishlist ? "red" : "none"}
            />
          </TouchableOpacity>
        </View>
        <View className="p-4">
          <Text className="text-3xl font-bold mb-2">{movie.title}</Text>
          <View className="flex-row items-center mb-2">
            <StarIcon size={20} color="#fbbf24" />
            <Text className="ml-2 text-base text-gray-700">
              {movie.rating}/10 IMDb
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <CalendarDaysIcon size={20} color="#6b7280" />
            <Text className="ml-2 text-base text-gray-700">
              Release Date: {new Date(movie.year).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row items-center mb-2">
            <ClockIcon size={20} color="#6b7280" />
            <Text className="ml-2 text-base text-gray-700">
              Duration: {movie.duration} minutes
            </Text>
          </View>
          <View className="flex-row items-center mb-4">
            <FilmIcon size={20} color="#6b7280" />
            <Text className="ml-2 text-base text-gray-700">
              Genre: {movie.genre}
            </Text>
          </View>

          <Text className="text-base leading-6 mb-4">{movie.summary}</Text>
        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={handleBuyTicket}
        className="w-full h-20 bg-blue-600 py-3 px-4 mt-6 flex-row items-center justify-center absolute bottom-0 left-0 right-0"
      >
        <Text className="text-white text-lg font-bold mr-2">Buy Ticket</Text>
        <IconSymbol size={28} name="ticket.fill" color="white" />
      </TouchableOpacity>
    </View>
  )
}

export default MovieDetailScreen
