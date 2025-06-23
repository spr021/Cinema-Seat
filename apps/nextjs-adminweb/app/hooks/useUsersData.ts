import { useState, useEffect } from "react"
import { User } from "../types/user"

interface UseUsersDataResult {
  users: User[]
  isLoading: boolean
  error: string | null
  searchTerm: string
  setSearchTerm: (term: string) => void
  fetchUsers: () => Promise<void>
  filteredUsers: User[]
  setError: (error: string | null) => void
}

export function useUsersData(): UseUsersDataResult {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  async function fetchUsers() {
    try {
      setIsLoading(true)
      setError(null)
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token")
      if (!token) {
        setError("No authentication token found.")
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch users")
      }

      const data = await response.json()
      setUsers(data.data)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("An unknown error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter((user) => {
    if (user.name && user.email) {
      return (
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    return false
  })

  return {
    users,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    fetchUsers,
    filteredUsers,
    setError,
  }
}
