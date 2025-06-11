import React, { useEffect, useState } from "react"
import { View, Text, ActivityIndicator, Alert, ScrollView } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Button, ButtonText } from "@/components/ui/button"
import { DatePicker } from "@/components/select-ticket/DatePicker"
import { TimeSelector } from "@/components/select-ticket/TimeSelector"
import { SeatSelector } from "@/components/select-ticket/SeatSelector"
import { useShowData } from "@/hooks/useShowData"
import { getFormattedDate, getFormattedTime } from "@/utils/date"
import {
  createReservation,
  markReservationAsPaid,
} from "@/services/reservationService" // Import createReservation and markReservationAsPaid
import { useAuth } from "@/context/AuthContext" // Import useAuth

export default function SelectTicketScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { user, token } = useAuth() // Get user and token from AuthContext
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isReserving, setIsReserving] = useState<boolean>(false) // Local loading state for reservation

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

    if (!user || !token) {
      Alert.alert(
        "Authentication Required",
        "Please log in to make a reservation."
      )
      router.push("/auth/login") // Redirect to login if not authenticated
      return
    }

    setIsReserving(true) // Start loading

    const currentShow = shows.find(
      (show) =>
        getFormattedDate(show.date) === selectedDate &&
        getFormattedTime(show.date) === selectedTime
    )
    console.log("Current Show:", selectedTime)

    if (!currentShow) {
      Alert.alert("Error", "Selected show not found.")
      setIsReserving(false) // End loading
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

      const result = await createReservation(
        currentShow._id, // Pass the show ID
        seatIdsToReserve,
        user.id, // Pass the actual user ID
        token // Pass the authentication token
      )

      if (result.success) {
        Alert.alert(
          "Reservation Successful",
          `Seats ${selectedSeats.join(
            ", "
          )} reserved for show on ${selectedDate} at ${selectedTime}.`,
          [
            {
              text: "OK",
              onPress: async () => {
                // Simulate payment confirmation
                Alert.alert(
                  "Payment Confirmation",
                  "Do you want to mark this reservation as paid?",
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                      onPress: () => router.push("/(tabs)/my-tickets"),
                    },
                    {
                      text: "Confirm Payment",
                      onPress: async () => {
                        if (result.reservation?._id) {
                          const paymentResult = await markReservationAsPaid(
                            result.reservation._id,
                            token
                          )
                          if (paymentResult.success) {
                            Alert.alert(
                              "Payment Successful",
                              paymentResult.message
                            )
                            router.push("/(tabs)/my-tickets")
                          } else {
                            Alert.alert(
                              "Payment Failed",
                              paymentResult.message ||
                                "Could not mark reservation as paid."
                            )
                          }
                        } else {
                          Alert.alert(
                            "Error",
                            "Reservation ID not found for payment."
                          )
                        }
                      },
                    },
                  ]
                )
              },
            },
          ]
        )
      } else {
        Alert.alert(
          "Reservation Failed",
          result.message || "Failed to create reservation."
        )
      }
    } catch (err: any) {
      Alert.alert(
        "Reservation Failed",
        err.message || "Failed to create reservation."
      )
    } finally {
      setIsReserving(false) // End loading
    }
  }

  useEffect(() => {
    // Reset selected seats when date or time changes
    setSelectedSeats([])
  }, [selectedDate, selectedTime])

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
            isReserving || // Disable button during reservation
            !selectedDate ||
            !selectedTime ||
            selectedSeats.length === 0
          }
          className="w-full h-20 bg-blue-600 absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 flex-1 justify-center items-center"
        >
          {isReserving ? ( // Use isReserving for button loading indicator
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
