import { useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useFocusEffect } from "@react-navigation/native"
import { Movie } from "@/types/movie"

const WISHLIST_KEY = "userWishlist"

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      async function loadWishlist() {
        try {
          const storedWishlist = await AsyncStorage.getItem(WISHLIST_KEY)
          if (storedWishlist) {
            setWishlist(JSON.parse(storedWishlist))
          }
        } catch (error) {
          console.error("Failed to load wishlist from AsyncStorage", error)
        } finally {
          setIsLoading(false)
        }
      }

      loadWishlist()
    }, [])
  )

  const saveWishlistToStorage = async (updatedWishlist: Movie[]) => {
    try {
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist))
    } catch (error) {
      console.error("Failed to save wishlist to AsyncStorage", error)
    }
  }

  const addMovieToWishlist = (movie: Movie) => {
    setWishlist((prevWishlist) => {
      if (!prevWishlist.some((m) => m._id === movie._id)) {
        const updatedWishlist = [...prevWishlist, movie]
        saveWishlistToStorage(updatedWishlist)
        return updatedWishlist
      }
      return prevWishlist
    })
  }

  const removeMovieFromWishlist = (movieId: string) => {
    setWishlist((prevWishlist) => {
      const updatedWishlist = prevWishlist.filter(
        (movie) => movie._id !== movieId
      )
      saveWishlistToStorage(updatedWishlist)
      return updatedWishlist
    })
  }

  const isMovieInWishlist = (movieId: string) => {
    return wishlist.some((movie) => movie._id === movieId)
  }

  return {
    wishlist,
    addMovieToWishlist,
    removeMovieFromWishlist,
    isMovieInWishlist,
    isLoading,
  }
}
