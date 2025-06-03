import React from "react"
import { View, FlatList, Dimensions, Text } from "react-native"
import { Movie } from "../types/movie"
import { MovieCard } from "./MovieCard"
import { useWishlist } from "@/hooks/useWishlist"

interface MovieSliderProps {
  movies: Movie[]
  size: "small" | "big"
  title?: string
}

const { width: screenWidth } = Dimensions.get("window")

const MovieSlider: React.FC<MovieSliderProps> = ({ movies, size, title }) => {
  const { wishlist } = useWishlist()

  const getItemLayout = (data: any, index: number) => {
    const itemWidth = size === "small" ? screenWidth / 2 : screenWidth / 1.5
    return { length: itemWidth, offset: itemWidth * index, index }
  }

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <MovieCard item={item} size={size} />
  )

  return (
    <View>
      {title && <Text className="px-2 mb-4 text-2xl font-bold">{title}</Text>}
      <FlatList
        data={movies}
        renderItem={renderMovieItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={size === "small" ? screenWidth / 2 : screenWidth / 1.5}
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        extraData={wishlist}
      />
    </View>
  )
}

export default MovieSlider
