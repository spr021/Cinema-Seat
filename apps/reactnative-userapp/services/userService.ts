import { User } from "@/types/user"

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
