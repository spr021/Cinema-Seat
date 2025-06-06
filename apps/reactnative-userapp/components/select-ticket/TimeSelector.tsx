import React from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"

export interface TimeSelectorProps {
  selectedTime: string
  onSelectTime: (time: string) => void
  availableTimes: string[]
}

export function TimeSelector({
  selectedTime,
  onSelectTime,
  availableTimes,
}: TimeSelectorProps) {
  return (
    <View className="mb-4">
      <Text className="text-lg font-semibold mb-2">Select Show Time</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {availableTimes.map((time: string) => {
          const isSelected = selectedTime === time
          return (
            <TouchableOpacity
              key={time}
              className={`p-3 mx-1 rounded-lg items-center justify-center ${
                isSelected ? "bg-blue-600" : "bg-gray-200"
              }`}
              onPress={() => onSelectTime(time)}
            >
              <Text
                className={`text-base font-bold ${
                  isSelected ? "text-white" : "text-gray-900"
                }`}
              >
                {time}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}
