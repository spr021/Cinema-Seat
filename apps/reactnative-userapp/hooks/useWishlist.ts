import { useWishlistContext } from "@/context/WishlistContext"

/**
 * Shared wishlist hook. State and the backend sync live in WishlistProvider,
 * so every consumer (movie cards, sliders, the wishlist tab) reads the same
 * data without each firing its own /auth/profile request.
 */
export function useWishlist() {
  return useWishlistContext()
}
