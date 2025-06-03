import React from "react"
import {
  View,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native"
import { ThemedText } from "@/components/ThemedText"
import { Link } from "expo-router"
import { Movie } from "../types/movie" // Import the common Movie interface
import { StarIcon } from "lucide-react-native" // Import StarIcon from lucide-react-native

interface MovieSliderProps {
  movies: Movie[]
  size: "small" | "big"
}

const { width: screenWidth } = Dimensions.get("window")

const MovieSlider: React.FC<MovieSliderProps> = ({ movies, size }) => {
  const getItemLayout = (data: any, index: number) => {
    const itemWidth = size === "small" ? screenWidth / 2 : screenWidth / 1.5
    return { length: itemWidth, offset: itemWidth * index, index }
  }

  const renderMovieItem = ({ item }: { item: Movie }) => {
    const itemWidth = size === "small" ? screenWidth / 2 : screenWidth / 1.5
    const imageHeight = size === "small" ? 220 : 250

    const renderStars = (rating: number) => {
      const filledStars = Math.floor(rating / 2) // Assuming rating is out of 10, so 5 stars max
      const hasHalfStar = rating % 2 >= 1

      const stars = []
      for (let i = 0; i < filledStars; i++) {
        stars.push(
          <StarIcon
            key={`full-${i}`}
            size={20}
            color="#FFD700"
            className="mr-0.5"
          />
        )
      }
      if (hasHalfStar) {
        stars.push(
          <StarIcon key="half" size={20} color="#FFD700" className="mr-0.5" />
        )
      }
      return <View className="flex-row gap-px">{stars}</View>
    }

    return (
      <Link href={`/movie/${item._id}`} asChild>
        <TouchableOpacity
          className={`p-2 items-start`}
          style={{ width: itemWidth }}
        >
          <Image
            source={{ uri: item.img }} // Use posterUrl from the common Movie interface
            className={`w-full rounded-lg mb-1`}
            style={{ height: imageHeight }}
          />
          <View className="flex-row justify-between w-full items-center mt-1">
            <ThemedText
              type="subtitle"
              numberOfLines={1}
              ellipsizeMode="tail"
              className="flex-shrink mr-1"
            >
              {item.title}
            </ThemedText>
            <ThemedText className="text-xs text-gray-500">
              {new Date(item.year).getFullYear()}
            </ThemedText>
          </View>
          {renderStars(item.rating)}
        </TouchableOpacity>
      </Link>
    )
  }

  return (
    <FlatList
      data={movies}
      renderItem={renderMovieItem}
      keyExtractor={(item) => item._id} // Use _id from the common Movie interface
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={size === "small" ? screenWidth / 2 : screenWidth / 1.5}
      decelerationRate="fast"
      getItemLayout={getItemLayout}
    />
  )
}

export default MovieSlider
