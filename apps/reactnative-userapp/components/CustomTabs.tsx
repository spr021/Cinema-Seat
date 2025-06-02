import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface Tab {
  title: string;
  content: React.ReactNode;
}

interface CustomTabsProps {
  tabs: Tab[];
}

export function CustomTabs({ tabs }: CustomTabsProps) {
  const [activeTab, setActiveTab] = useState(0);
  const colorScheme = useColorScheme();
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  return (
    <ThemedView style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBar}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tabItem,
              activeTab === index && { borderBottomColor: tintColor, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab(index)}>
            <ThemedText type="defaultSemiBold" style={{ color: activeTab === index ? tintColor : Colors[colorScheme ?? 'light'].text }}>
              {tab.title}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={styles.tabContent}>
        {tabs[activeTab].content}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
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
});
