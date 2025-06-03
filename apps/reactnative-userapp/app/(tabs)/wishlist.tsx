import { View, Text, FlatList } from "react-native"

import { useWishlist } from "@/hooks/useWishlist"
import { Movie } from "@/types/movie"
import { MovieCard } from "@/components/MovieCard"

export default function WishlistScreen() {
  const { wishlist, isLoading } = useWishlist()

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center min-h-screen-safe-offset-2">
        <Text>Loading wishlist...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1">
      {wishlist.length === 0 ? (
        <View className="flex-1 items-center justify-center min-h-screen-safe-offset-2">
          <Text>Your wishlist is empty. Add some movies!</Text>
        </View>
      ) : (
        <FlatList
          className="flex-1 mb-20"
          data={wishlist}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View className="px-4 py-2">
              <MovieCard item={item} size="full" />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  )
}
