import React from "react"
import { View, Text, TouchableOpacity } from "react-native"
import Svg, { Path } from "react-native-svg"
import { Seat } from "./types"

export interface SeatSelectorProps {
  selectedSeats: string[]
  onToggleSeat: (seat: string) => void
  availableSeats: Seat[]
  selectedTime: string
}

export function SeatSelector({
  selectedSeats,
  onToggleSeat,
  availableSeats,
  selectedTime,
}: SeatSelectorProps) {
  // Dynamically determine rows and seats per row from availableSeats
  const uniqueRows = Array.from(
    new Set(availableSeats.map((seat) => seat.row))
  ).sort()

  const getSeatsInRow = (row: string) => {
    return availableSeats
      .filter((seat) => seat.row === row)
      .map((seat) => parseInt(seat.seatNumber, 10))
      .sort((a, b) => a - b)
  }

  const renderSeat = (row: string, seatNum: number) => {
    const seatId = `${row}${seatNum}`
    const seat = availableSeats.find(
      (s) => s.row === row && s.seatNumber === String(seatNum)
    )
    const isSelected = selectedSeats.includes(seatId)
    const isOccupied = !seat?.isAvailable

    return (
      <TouchableOpacity
        key={seatId}
        className={`w-12 h-11 mx-1 my-1 rounded-lg items-center justify-center border-2 ${
          isSelected
            ? "bg-yellow-500 border-yellow-600"
            : isOccupied
              ? "bg-gray-700 border-gray-800"
              : "bg-white border-gray-300"
        }`}
        onPress={() => !isOccupied && onToggleSeat(seatId)}
        disabled={isOccupied || !selectedTime}
      >
        <Svg width={40} height={40} viewBox="0 0 40 40">
          <Path
            d="M0,20 Q0,30 10,30 H30 Q40,30 40,20 V40 H0 Z"
            fill="#6b7280" // Gray color for the base
          />
        </Svg>
      </TouchableOpacity>
    )
  }

  return (
    <View className="mb-4 p-4">
      <View className="items-center mb-4">
        <View className="align-items-center">
          <Svg width={300} height={50} viewBox="0 0 300 50">
            <Path
              d="M0,50 Q150,0 300,50"
              stroke="#ccc"
              strokeWidth={4}
              fill="none"
            />
          </Svg>
        </View>
        <Text className="text-lg font-semibold -mt-4">Screen</Text>
      </View>

      {!selectedTime ? (
        <View className="items-center justify-center h-48">
          <Text className="text-lg">
            Please select a time slot to view seats.
          </Text>
        </View>
      ) : (
        <View className="flex-col items-center">
          {uniqueRows.map((row, index) => {
            const seatsInRow = getSeatsInRow(row)
            return (
              <View key={index} className="flex-row items-center mb-1">
                {seatsInRow.map((seatNum, index) => (
                  <React.Fragment key={index}>
                    {renderSeat(row, seatNum)}
                    {index === Math.floor(seatsInRow.length / 2) - 1 && (
                      <View key={`space-${row}-${index}`} className="w-5" />
                    )}
                  </React.Fragment>
                ))}
              </View>
            )
          })}
        </View>
      )}

      <View className="flex-row justify-around mt-6">
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-gray-700 rounded-sm mr-2" />
          <Text>Reserved</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-white rounded-sm mr-2 border-2" />
          <Text>Available</Text>
        </View>
        <View className="flex-row items-center">
          <View className="w-4 h-4 bg-yellow-500 rounded-sm mr-2" />
          <Text>Selected</Text>
        </View>
      </View>
    </View>
  )
}
