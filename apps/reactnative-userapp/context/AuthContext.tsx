import React, { createContext, useState, useContext, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"

interface User {
  id: string
  email: string
  username: string
  // Add other user properties as needed
}

interface AuthContextProps {
  token: string | null
  setToken: (token: string | null) => void
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextProps>({
  token: null,
  setToken: () => {},
  user: null,
  setUser: () => {},
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
          setUser(JSON.parse(storedUser))
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
    <AuthContext.Provider value={{ token, setToken, user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  return useContext(AuthContext)
}

export { AuthContext, AuthProvider, useAuth }
