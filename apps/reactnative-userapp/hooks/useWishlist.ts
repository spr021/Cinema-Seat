import { useState, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import { Movie } from "@/types/movie"
import { useAuth } from "@/context/AuthContext"
import { toggleMovieLike, fetchUserProfile } from "@/services/userService"

const WISHLIST_KEY = "userWishlist"

export function useWishlist() {
  const { user, token, updateUser } = useAuth()
  const [wishlist, setWishlist] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const saveWishlistToStorage = async (updatedWishlist: Movie[]) => {
    try {
      const stringifiedWishlist = JSON.stringify(updatedWishlist)
      await AsyncStorage.setItem(WISHLIST_KEY, stringifiedWishlist)
    } catch (error) {
      console.error("Failed to save wishlist to AsyncStorage", error)
    }
  }

  useFocusEffect(
    useCallback(() => {
      async function loadAndSyncWishlist() {
        setIsLoading(true)
        let localWishlist: Movie[] = []
        try {
          const storedWishlist = await AsyncStorage.getItem(WISHLIST_KEY)
          if (storedWishlist) {
            localWishlist = JSON.parse(storedWishlist)
          }
        } catch (error) {
          console.error("Failed to load wishlist from AsyncStorage", error)
        }

        if (token && user?._id) {
          try {
            const fetchedUser = await fetchUserProfile(token)

            if (fetchedUser?.data?.likes) {
              // Backend likes are the source of truth for liked movies
              const backendLikes: Movie[] = fetchedUser.data.likes as Movie[]

              // Merge with local wishlist, prioritizing backend data for duplicates
              const combinedList = [...backendLikes, ...localWishlist]
              const uniqueMoviesMap = new Map<string, Movie>()
              combinedList.forEach((movie) => {
                if (movie && movie._id) {
                  // Ensure movie and _id exist
                  uniqueMoviesMap.set(movie._id, movie)
                }
              })
              const mergedWishlist = Array.from(uniqueMoviesMap.values())

              setWishlist(mergedWishlist)
              saveWishlistToStorage(mergedWishlist)
              updateUser({ ...user, likes: fetchedUser.data.likes as Movie[] }) // Update AuthContext

              // Clear local storage after merging
              AsyncStorage.removeItem(WISHLIST_KEY)

              // Update backend with merged wishlist
              mergedWishlist.forEach(async (movie) => {
                if (!backendLikes.some((m) => m._id === movie._id)) {
                  await toggleLike(movie)
                }
              })
            } else {
              setWishlist(localWishlist) // If no backend likes, use local
            }
          } catch (error) {
            console.error("Failed to load wishlist from backend", error)
            setWishlist(localWishlist) // Fallback to local if backend fetch fails
          }
        } else {
          setWishlist(localWishlist) // If not authenticated, use local
        }
        setIsLoading(false)
      }

      loadAndSyncWishlist()
    }, [token, user?._id, updateUser])
  )

  const toggleLike = async (movie: Movie) => {
    if (!token || !user) {
      // Store movie locally if not authenticated
      let localWishlist: Movie[] = []
      try {
        const storedWishlist = await AsyncStorage.getItem(WISHLIST_KEY)
        if (storedWishlist) {
          localWishlist = JSON.parse(storedWishlist)
        }
      } catch (error) {
        console.error("Failed to load wishlist from AsyncStorage", error)
      }

      const isMovieInLocalWishlist = localWishlist.some(
        (m) => m._id === movie._id
      )

      if (isMovieInLocalWishlist) {
        localWishlist = localWishlist.filter((m) => m._id !== movie._id)
      } else {
        localWishlist.push(movie)
      }

      saveWishlistToStorage(localWishlist)
      setWishlist(localWishlist)
      return
    }

    try {
      const updatedLikes = await toggleMovieLike(token, movie._id)
      const newWishlist = updatedLikes as Movie[]
      setWishlist(newWishlist)
      saveWishlistToStorage(newWishlist)
      updateUser({ ...user, likes: updatedLikes })
    } catch (error) {
      console.error("Failed to toggle movie like:", error)
    }
  }

  const isMovieInWishlist = (movieId: string) => {
    return wishlist.some((movie) => movie._id === movieId)
  }

  return {
    wishlist,
    toggleLike, // Expose toggleLike instead of add/remove
    isMovieInWishlist,
    isLoading,
  }
}
