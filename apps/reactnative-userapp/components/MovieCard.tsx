import React from "react"
import { View, Image, TouchableOpacity, Text, Dimensions } from "react-native"
import { Link } from "expo-router"
import { Movie } from "../types/movie"
import { StarIcon, HeartIcon } from "lucide-react-native"
import { useWishlist } from "@/hooks/useWishlist"

interface MovieCardProps {
  item: Movie
  size: "small" | "big" | "full"
}

const { width: screenWidth } = Dimensions.get("window")

function MovieCard({ item, size }: MovieCardProps) {
  const { addMovieToWishlist, removeMovieFromWishlist, isMovieInWishlist } =
    useWishlist()

  const itemWidth =
    size === "small"
      ? screenWidth / 2
      : size === "big"
        ? screenWidth / 1.5
        : screenWidth - 16 * 2 // Full width with horizontal padding
  const imageHeight = size === "small" ? 220 : 250
  const isInWishlist = isMovieInWishlist(item._id)

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeMovieFromWishlist(item._id)
    } else {
      addMovieToWishlist(item)
    }
  }

  const renderStars = (rating: number) => {
    const filledStars = Math.floor(rating / 2)
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
        className={`p-2 items-start relative`}
        style={{ width: itemWidth }}
      >
        <Image
          source={{ uri: item.img }}
          className={`w-full rounded-lg mb-1`}
          style={{ height: imageHeight }}
        />
        <TouchableOpacity
          onPress={handleWishlistToggle}
          className="absolute top-3 right-3 p-1 bg-black/50 rounded-full"
        >
          <HeartIcon
            size={24}
            color={isInWishlist ? "red" : "white"}
            fill={isInWishlist ? "red" : "none"}
          />
        </TouchableOpacity>
        <View className="flex-row justify-between w-full items-center mt-1">
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            className="flex-shrink mr-1 text-lg font-bold"
          >
            {item.title}
          </Text>
          <Text className="text-xs text-gray-500">
            {new Date(item.year).getFullYear()}
          </Text>
        </View>
        {renderStars(item.rating)}
      </TouchableOpacity>
    </Link>
  )
}

export { MovieCard }
