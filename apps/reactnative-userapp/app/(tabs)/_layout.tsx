import { Tabs } from "expo-router"
import React from "react"
import { Platform } from "react-native"
import { HapticTab } from "@/components/HapticTab"
import { IconSymbol } from "@/components/ui/IconSymbol"
import TabBarBackground from "@/components/ui/TabBarBackground"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"

export default function TabLayout() {
  const colorScheme = useColorScheme()
  const { logout } = useAuth()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: "transparent",
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          headerShown: true,
          headerSearchBarOptions: {
            placeholder: "Search Wishlist",
            onChangeText: (e) => console.log(e.nativeEvent.text),
            onSubmitEditing: (e) =>
              console.log("Search submitted:", e.nativeEvent.text),
          },
          title: "Wishlist",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="heart.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-tickets"
        options={{
          headerShown: true,
          title: "My Tickets",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="ticket.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: true,
          title: "Profile",
          headerRight: () => (
            <Button className="bg-white" onPress={logout}>
              <IconSymbol
                size={28}
                name="rectangle.portrait.and.arrow.right"
                color={Colors[colorScheme ?? "light"].text}
                style={{ marginRight: 10 }}
              />
            </Button>
          ),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
