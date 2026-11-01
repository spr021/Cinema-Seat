import React, { useEffect, useRef, useState } from "react"
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
import {
  holdSeats,
  releaseHeldSeats,
} from "@/services/showService" // Seat holds while paying
import { useAuth } from "@/context/AuthContext" // Import useAuth

export default function SelectTicketScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { user, token } = useAuth() // Get user and token from AuthContext
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isReserving, setIsReserving] = useState<boolean>(false) // Local loading state for reservation
  // Active seat hold for this user (ms timestamp), shown as a countdown
  const [holdUntil, setHoldUntil] = useState<number | null>(null)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const heldSeatIdsRef = useRef<string[]>([])

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
    if (holdUntil) {
      // Seats are locked while the payment hold is active
      Alert.alert(
        "Seats on hold",
        "Your seats are held for payment. Complete or cancel the payment first."
      )
      return
    }
    setSelectedSeats((prevSeats) =>
      prevSeats.includes(seatId)
        ? prevSeats.filter((seat) => seat !== seatId)
        : [...prevSeats, seatId]
    )
  }

  // Tick the hold countdown every second
  useEffect(() => {
    if (!holdUntil) return
    const tick = () => {
      const remaining = Math.max(
        0,
        Math.ceil((holdUntil - Date.now()) / 1000)
      )
      setRemainingSeconds(remaining)
      if (remaining === 0) {
        setHoldUntil(null)
        setSelectedSeats([])
        Alert.alert(
          "Hold expired",
          "Your seats were released because the payment window ended."
        )
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [holdUntil])

  // Release still-held seats if the user leaves the screen mid-payment
  useEffect(() => {
    return () => {
      const seatIds = heldSeatIdsRef.current
      const authToken = token
      if (seatIds.length > 0 && authToken) {
        releaseHeldSeats(authToken, seatIds)
      }
    }
  }, [token])

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

      // Hold the seats for the payment window; the reservation consumes the hold
      const hold = await holdSeats(token, seatIdsToReserve)
      if (!hold.success) {
        Alert.alert(
          "Seats unavailable",
          hold.message || "Could not hold those seats. Please try others."
        )
        setIsReserving(false)
        return
      }
      heldSeatIdsRef.current = seatIdsToReserve
      if (hold.holdUntil) {
        setHoldUntil(new Date(hold.holdUntil).getTime())
      }

      const result = await createReservation(
        currentShow._id, // Pass the show ID
        seatIdsToReserve,
        user._id ?? user.id ?? "", // Pass the actual user ID
        token // Pass the authentication token
      )

      if (result.success) {
        // Hold is now consumed by the reservation
        heldSeatIdsRef.current = []
        setHoldUntil(null)

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
        // Reservation failed: release the hold so others can book
        heldSeatIdsRef.current = []
        setHoldUntil(null)
        await releaseHeldSeats(token, seatIdsToReserve)
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
      {holdUntil !== null && (
        <View className="bg-yellow-100 border-t border-yellow-300 px-4 py-3">
          <Text className="text-center text-yellow-800 font-semibold">
            {`Seats held — ${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")} to complete payment`}
          </Text>
        </View>
      )}
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
