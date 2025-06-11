import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native"
import { useRouter } from "expo-router"
import { Button, ButtonText } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function LoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setToken, setUser } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      )

      const data = await response.json()

      if (response.ok) {
        setToken(data.token)
        setUser(data.user) // Assuming the API returns a user object
        Alert.alert("Success", "Logged in successfully!")
        router.replace("/(tabs)") // Navigate to the main app screen
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials.")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      Alert.alert("Error", error.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View className="flex-1 justify-center items-center p-4 bg-white">
      <Text className="text-4xl font-bold mb-8 text-center">Login</Text>

      <TextInput
        className="w-full p-4 mb-4 border border-gray-300 rounded-lg text-lg"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        className="w-full p-4 mb-6 border border-gray-300 rounded-lg text-lg"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        action="primary"
        variant="solid"
        onPress={handleLogin}
        disabled={isLoading}
        className="w-full h-14 bg-blue-600 rounded-lg flex-row justify-center items-center"
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ButtonText className="text-white text-xl font-bold">
            Login
          </ButtonText>
        )}
      </Button>

      <TouchableOpacity
        onPress={() => router.push("/auth/signup")}
        className="mt-4"
      >
        <Text className="text-blue-600 text-base">
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </View>
  )
}
