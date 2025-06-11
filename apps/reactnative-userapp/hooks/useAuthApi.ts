import { useAuth } from "@/context/AuthContext"
import { updateUserData, deleteUserAccount } from "@/services/userService"

export const useAuthApi = () => {
  const { token, logout } = useAuth()

  const updateProfile = async (data: {
    name?: string
    email?: string
    password?: string
  }) => {
    try {
      const responseData = await updateUserData(token!, data)
      return responseData
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  }

  const deleteAccount = async (userId: string) => {
    try {
      const responseData = await deleteUserAccount(token!, userId)
      logout()
      return responseData
    } catch (error) {
      console.error("Delete account error:", error)
      throw error
    }
  }

  return {
    updateProfile,
    deleteAccount,
  }
}
