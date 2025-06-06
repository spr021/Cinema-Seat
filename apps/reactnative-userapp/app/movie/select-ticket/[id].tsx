import React, { useState } from "react"
import { View, Text, ActivityIndicator, Alert, ScrollView } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Button, ButtonText } from "@/components/ui/button"
import { DatePicker } from "@/components/select-ticket/DatePicker"
import { TimeSelector } from "@/components/select-ticket/TimeSelector"
import { SeatSelector } from "@/components/select-ticket/SeatSelector"
import { useShowData } from "@/hooks/useShowData"
import { reserveSeats } from "@/services/showService"
import { getFormattedDate, getFormattedTime } from "@/utils/date"

export default function SelectTicketScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])

  const {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    availableDates,
    availableTimes,
    availableSeats,
    isLoading,
    error,
    shows, // Keep shows for finding currentShow in handleProceedToPay
  } = useShowData(id)

  const handleToggleSeat = (seatId: string) => {
    setSelectedSeats((prevSeats) =>
      prevSeats.includes(seatId)
        ? prevSeats.filter((seat) => seat !== seatId)
        : [...prevSeats, seatId]
    )
  }

  const handleProceedToPay = async () => {
    if (!selectedDate || !selectedTime || selectedSeats.length === 0) {
      Alert.alert(
        "Selection Required",
        "Please select a date, time, and at least one seat."
      )
      return
    }

    // Set loading state for the button action
    // This isLoading is separate from the useShowData's isLoading
    // as it pertains to the reservation process.
    // I'll introduce a local loading state for this.
    const currentShow = shows.find(
      (show) =>
        getFormattedDate(show.date) === selectedDate &&
        getFormattedTime(show.date) === selectedTime
    )
    console.log("Current Show:", selectedTime)

    if (!currentShow) {
      Alert.alert("Error", "Selected show not found.")
      return
    }

    try {
      const seatIdsToReserve = selectedSeats
        .map((seatIdString) => {
          const seat = availableSeats.find(
            (s) => `${s.row}${s.seatNumber}` === seatIdString
          )
          return seat?._id
        })
        .filter((seatId) => seatId !== undefined) as string[]

      if (seatIdsToReserve.length !== selectedSeats.length) {
        throw new Error("Some selected seats could not be found.")
      }

      const result = await reserveSeats(
        seatIdsToReserve,
        "60d5ecf7b7e1c20015a4a1b2" // Placeholder for actual user ID
      )

      if (result.success) {
        Alert.alert(
          "Reservation Successful",
          `Seats ${selectedSeats.join(
            ", "
          )} reserved for show on ${selectedDate} at ${selectedTime}.`
        )
        router.push("/(tabs)/my-tickets")
      } else {
        Alert.alert(
          "Reservation Failed",
          result.message || "Failed to reserve seats."
        )
      }
    } catch (err: any) {
      Alert.alert(
        "Reservation Failed",
        err.message || "Failed to reserve seats."
      )
    }
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4 pb-24">
        <Text className="text-3xl font-bold mb-6 text-center">
          Select Your Tickets
        </Text>

        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
        {error && <Text className="text-red-500 text-center">{error}</Text>}

        {!isLoading && !error && (
          <>
            <DatePicker
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              availableDates={availableDates}
            />
            <TimeSelector
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              availableTimes={availableTimes}
            />
            <SeatSelector
              selectedSeats={selectedSeats}
              onToggleSeat={handleToggleSeat}
              availableSeats={availableSeats}
              selectedTime={selectedTime}
            />
          </>
        )}
      </ScrollView>
      {!isLoading && !error && (
        <Button
          action="primary"
          variant="solid"
          onPress={handleProceedToPay}
          disabled={
            isLoading ||
            !selectedDate ||
            !selectedTime ||
            selectedSeats.length === 0
          }
          className="w-full h-20 bg-blue-600 absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 flex-1 justify-center items-center"
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <ButtonText className="h-7 text-white text-lg font-bold mr-2">
                Proceed to Pay
              </ButtonText>
              <IconSymbol size={28} name="creditcard.fill" color="white" />
            </>
          )}
        </Button>
      )}
    </View>
  )
}
