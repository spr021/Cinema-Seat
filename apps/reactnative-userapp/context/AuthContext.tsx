import React, { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { verifyToken } from "../services/userService"
import { User } from "@/types/user" // Import the shared User interface

interface AuthContextProps {
  token: string | null
  setToken: (token: string | null) => void
  user: User | null
  setUser: (user: User | null) => void
  updateUser: (userData: Partial<User>) => void // Add updateUser
  logout: () => void
}

const AuthContext = createContext<AuthContextProps>({
  token: null,
  setToken: () => {},
  user: null,
  setUser: () => {},
  updateUser: () => {}, // Initialize updateUser
  logout: () => {},
})

interface AuthProviderProps {
  children: React.ReactNode
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token")
        const storedUser = await AsyncStorage.getItem("user")
        if (storedToken) {
          setToken(storedToken)
        }
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          console.log("AuthContext: User loaded from AsyncStorage:", parsedUser)
        }

        if (storedToken) {
          console.log("Verifying stored token...")

          const isValid = await verifyToken(storedToken)
          if (!isValid) {
            console.log("Stored token invalid, logging out...")
            await AsyncStorage.removeItem("token")
            await AsyncStorage.removeItem("user")
            setToken(null)
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Failed to load auth data from storage", error)
      } finally {
        setLoading(false)
      }
    }
    loadAuthData()
  }, [])

  useEffect(() => {
    const saveAuthData = async () => {
      try {
        if (token) {
          await AsyncStorage.setItem("token", token)
        } else {
          await AsyncStorage.removeItem("token")
        }
        if (user) {
          await AsyncStorage.setItem("user", JSON.stringify(user))
        } else {
          await AsyncStorage.removeItem("user")
        }
      } catch (error) {
        console.error("Failed to save auth data to storage", error)
      }
    }
    saveAuthData()
  }, [token, user])

  const updateUser = (userData: Partial<User>) => {
    setUser((prevUser) => {
      if (prevUser) {
        const updatedUser = { ...prevUser, ...userData }
        AsyncStorage.setItem("user", JSON.stringify(updatedUser)) // Update AsyncStorage
        return updatedUser
      }
      return prevUser
    })
  }

  const logout = async () => {
    setToken(null)
    setUser(null)
    await AsyncStorage.removeItem("token")
    await AsyncStorage.removeItem("user")
    router.push("/")
  }

  if (loading) {
    // You might want to render a loading spinner here
    return null
  }

  return (
    <AuthContext.Provider
      value={{ token, setToken, user, setUser, updateUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  return useContext(AuthContext)
}

export { AuthContext, AuthProvider, useAuth }
