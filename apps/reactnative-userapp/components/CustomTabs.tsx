import React, { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native"
import { Colors } from "@/constants/Colors"
import { useColorScheme } from "@/hooks/useColorScheme"

export interface Tab {
  title: string
  content: React.ReactNode
}

interface CustomTabsProps {
  tabs: Tab[]
}

export function CustomTabs({ tabs }: CustomTabsProps) {
  const [activeTab, setActiveTab] = useState(0)
  const colorScheme = useColorScheme()
  const tintColor = Colors[colorScheme ?? "light"].tint

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabItem,
              activeTab === index && {
                borderBottomColor: tintColor,
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setActiveTab(index)}
          >
            <Text
              style={{
                color:
                  activeTab === index
                    ? tintColor
                    : Colors[colorScheme ?? "light"].text,
              }}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={styles.tabContent}>
        {tabs[activeTab].content}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
    marginBottom: 10,
  },
  tabItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 10,
  },
})
