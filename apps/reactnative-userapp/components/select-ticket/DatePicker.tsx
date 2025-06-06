import React from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"

export interface DatePickerProps {
  selectedDate: string
  onSelectDate: (date: string) => void
  availableDates: string[]
}

export function DatePicker({
  selectedDate,
  onSelectDate,
  availableDates,
}: DatePickerProps) {
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  const getDayOfMonth = (dateString: string) => {
    const date = new Date(dateString)
    return date.getDate()
  }

  return (
    <View className="mb-4">
      <Text className="text-lg font-semibold mb-2">Select Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {availableDates.map((date: string) => {
          const isSelected = selectedDate === date
          return (
            <TouchableOpacity
              key={date}
              className={`p-3 mx-1 rounded-lg items-center justify-center ${
                isSelected ? "bg-blue-600" : "bg-gray-200"
              }`}
              onPress={() => onSelectDate(date)}
            >
              <Text
                className={`text-sm font-bold ${
                  isSelected ? "text-white" : "text-gray-700"
                }`}
              >
                {getDayOfWeek(date)}
              </Text>
              <Text
                className={`text-xl font-bold ${
                  isSelected ? "text-white" : "text-gray-900"
                }`}
              >
                {getDayOfMonth(date)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}
