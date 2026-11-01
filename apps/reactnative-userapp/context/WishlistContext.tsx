import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import { Movie } from "@/types/movie"
import { useAuth } from "@/context/AuthContext"
import { toggleMovieLike, fetchUserProfile } from "@/services/userService"

const WISHLIST_KEY = "userWishlist"

export interface WishlistContextProps {
  wishlist: Movie[]
  isLoading: boolean
  toggleLike: (movie: Movie) => Promise<void>
  isMovieInWishlist: (movieId: string) => boolean
}

const WishlistContext = createContext<WishlistContextProps>({
  wishlist: [],
  isLoading: true,
  toggleLike: async () => {},
  isMovieInWishlist: () => false,
})

/**
 * Single owner of the wishlist state and its backend sync. Previously every
 * MovieCard/MovieSlider called useWishlist(), so one focus event fired one
 * /auth/profile request per mounted card (~20+ calls per tab switch).
 */
const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token, updateUser } = useAuth()
  const [wishlist, setWishlist] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const saveWishlistToStorage = useCallback(async (list: Movie[]) => {
    try {
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(list))
    } catch (error) {
      console.error("Failed to save wishlist to AsyncStorage", error)
    }
  }, [])

  // One sync per focus for the WHOLE app, not per mounted card
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
                  uniqueMoviesMap.set(movie._id, movie)
                }
              })
              const mergedWishlist = Array.from(uniqueMoviesMap.values())

              setWishlist(mergedWishlist)
              saveWishlistToStorage(mergedWishlist)
              updateUser({ ...user, likes: fetchedUser.data.likes as Movie[] })

              // Local draft synced to the backend; the cache is no longer needed
              AsyncStorage.removeItem(WISHLIST_KEY)

              // Push any local-only entries the backend does not know about
              mergedWishlist.forEach(async (movie) => {
                if (!backendLikes.some((m) => m._id === movie._id)) {
                  await toggleMovieLike(token, movie._id).catch((error) => {
                    console.error("Failed to sync local wishlist entry:", error)
                  })
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
    }, [token, user?._id, updateUser, saveWishlistToStorage])
  )

  const toggleLike = useCallback(
    async (movie: Movie) => {
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

        const nextWishlist = isMovieInLocalWishlist
          ? localWishlist.filter((m) => m._id !== movie._id)
          : [...localWishlist, movie]

        await saveWishlistToStorage(nextWishlist)
        setWishlist(nextWishlist)
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
    },
    [token, user, updateUser, saveWishlistToStorage]
  )

  const isMovieInWishlist = useCallback(
    (movieId: string) => wishlist.some((movie) => movie._id === movieId),
    [wishlist]
  )

  const contextValue = useMemo(
    () => ({ wishlist, isLoading, toggleLike, isMovieInWishlist }),
    [wishlist, isLoading, toggleLike, isMovieInWishlist]
  )

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  )
}

const useWishlistContext = () => {
  return useContext(WishlistContext)
}

export { WishlistContext, WishlistProvider, useWishlistContext }
