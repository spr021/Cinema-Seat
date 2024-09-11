import { StyleSheet, Text, View } from "react-native"
import { StatusBar } from "expo-status-bar"
import { Button, UiKitProvider } from "@this/uikit";

export default function Native() {
  return (
    <UiKitProvider>
    <View style={styles.container}>
      <Text style={styles.header}>Native</Text>
      <Button

        onPress={() => {
          console.log("Pressed!")
          alert("Pressed!")
        }}
      >
        Boop
      </Button>
      <StatusBar style="auto" />
    </View>
    </UiKitProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontWeight: "bold",
    marginBottom: 20,
    fontSize: 36,
  },
})
