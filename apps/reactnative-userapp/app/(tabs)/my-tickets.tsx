import ParallaxScrollView from "@/components/ParallaxScrollView"
import { Text, View } from "react-native"

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
    >
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-2xl font-bold mb-4">My Tickets</Text>
        <Text>This is where your tickets will appear.</Text>
      </View>
    </ParallaxScrollView>
  )
}
