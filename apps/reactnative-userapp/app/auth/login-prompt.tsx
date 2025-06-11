import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Button, ButtonText } from "@/components/ui/button"
import { useRouter } from "expo-router"

export default function LoginPrompt() {
  const router = useRouter()

  const handleLoginPress = () => {
    router.navigate("/auth/login")
  }

  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        You are not logged in. Please log in to view this page.
      </Text>
      <Button
        action="primary"
        variant="solid"
        style={styles.loginButton}
        onPress={handleLoginPress}
      >
        <ButtonText>Go to Login</ButtonText>
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  loginButton: {
    width: "80%",
    backgroundColor: "#007bff",
  },
})
