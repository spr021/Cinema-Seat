import { User } from "@/types/user"
import { Movie } from "@/types/movie" // Import Movie type

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

export async function updateUserData(
  token: string,
  data: { name?: string; email?: string; password?: string }
): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to update user data")
  }

  const responseData = await response.json()
  return responseData.data // Assuming the backend returns { success: true, data: User }
}

export async function deleteUserAccount(
  token: string,
  userId: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/${userId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to delete user account")
  }

  return response.json()
}

export async function toggleMovieLike(
  token: string,
  movieId: string
): Promise<Movie[]> {
  // Change return type to Movie[]
  const response = await fetch(`${API_BASE_URL}/auth/toggle-movie-like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ movieId }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to toggle movie like")
  }

  const responseData = await response.json()
  return responseData.data // Assuming the backend returns the updated likes array (now Movie[])
}

export async function fetchUserProfile(
  token: string
): Promise<{ success: boolean; data: User }> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to fetch user profile")
  }

  const responseData = await response.json()
  return responseData
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      return true // Token is valid
    } else if (response.status === 401) {
      return false // Token is invalid (e.g., expired, unauthorized)
    } else {
      const errorData = await response.json()
      console.error(
        "Token verification failed with status:",
        response.status,
        errorData
      )
      return false // Other errors, treat as invalid for logout purposes
    }
  } catch (error) {
    console.error("Network error during token verification:", error)
    return false // Network error, treat as invalid for logout purposes
  }
}

export async function verifyCurrentPassword(
  token: string,
  currentPassword: string
): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ currentPassword }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to verify current password")
  }

  return response.json()
}
