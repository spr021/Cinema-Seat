import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { Button, ButtonText } from "@/components/ui/button"
import Svg, { Path } from "react-native-svg"

interface Seat {
  _id: string
  seatNumber: string
  row: string
  isAvailable: boolean
  reservedBy?: string
}

interface Show {
  _id: string
  date: string // This string will contain both date and time
  seats: Seat[]
  createdAt: string
  updatedAt: string
}

interface DatePickerProps {
  selectedDate: string
  onSelectDate: (date: string) => void
  availableDates: string[]
}

function DatePicker({
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

interface TimeSelectorProps {
  selectedTime: string
  onSelectTime: (time: string) => void
  availableTimes: string[]
}

function TimeSelector({
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

interface SeatSelectorProps {
  selectedSeats: string[]
  onToggleSeat: (seat: string) => void
  availableSeats: Seat[]
  selectedTime: string
}

function SeatSelector({
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
          {uniqueRows.map((row) => {
            const seatsInRow = getSeatsInRow(row)
            return (
              <View key={row} className="flex-row items-center mb-1">
                {seatsInRow.map((seatNum, index) => (
                  <React.Fragment key={`${row}-${seatNum}`}>
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

export default function SelectTicketScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [shows, setShows] = useState<Show[]>([])
  const [error, setError] = useState<string | null>(null)

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toISOString().split("T")[0] // Extracts YYYY-MM-DD
  }

  const availableDates = Array.from(
    new Set(shows.map((show) => getFormattedDate(show.date)))
  ).sort()
  const getFormattedTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const availableTimes = Array.from(
    new Set(
      shows
        .filter((show) => getFormattedDate(show.date) === selectedDate)
        .map((show) => getFormattedTime(show.date))
    )
  ).sort()
  const availableSeats =
    shows.find(
      (show) =>
        getFormattedDate(show.date) === selectedDate &&
        getFormattedTime(show.date) === selectedTime
    )?.seats || []

  useEffect(() => {
    async function fetchInitialShows() {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`http://localhost:4000/show/list/${id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Show[] = await response.json()
        setShows(data)

        if (data.length > 0) {
          const firstDate = getFormattedDate(data[0].date)
          setSelectedDate(firstDate)
          const firstTimeForDate = data.find(
            (show) => getFormattedDate(show.date) === firstDate
          )?.date
          if (firstTimeForDate) {
            setSelectedTime(getFormattedTime(firstTimeForDate))
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch initial show data.")
        Alert.alert(
          "Error",
          err.message || "Failed to fetch initial show data."
        )
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchInitialShows()
    }
  }, [id])

  useEffect(() => {
    async function fetchSeatsForSelectedShow() {
      if (!selectedDate || !selectedTime || isLoading) {
        return
      }

      const currentShow = shows.find(
        (show) =>
          getFormattedDate(show.date) === selectedDate &&
          getFormattedTime(show.date) === selectedTime
      )

      // Check if seats are already populated for the current show
      if (
        currentShow &&
        currentShow.seats.length > 0 &&
        typeof currentShow.seats[0] === "object"
      ) {
        return // Seats are already populated, no need to fetch again
      }

      if (currentShow && currentShow._id) {
        try {
          setIsLoading(true)
          setError(null)
          const response = await fetch(
            `http://localhost:4000/show/${currentShow._id}`
          )
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data: Show = await response.json()

          // Update the specific show in the shows array with populated seats
          setShows((prevShows) =>
            prevShows.map((show) => (show._id === data._id ? data : show))
          )
        } catch (err: any) {
          setError(
            err.message || "Failed to fetch seat data for selected show."
          )
          Alert.alert(
            "Error",
            err.message || "Failed to fetch seat data for selected show."
          )
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchSeatsForSelectedShow()
    setSelectedSeats([]) // Clear selected seats when date/time changes
  }, [selectedDate, selectedTime, shows, isLoading]) // Added shows and isLoading to dependencies to react to their changes

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

    setIsLoading(true)
    setError(null)

    const currentShow = shows.find(
      (show) =>
        getFormattedDate(show.date) === selectedDate &&
        getFormattedTime(show.date) === selectedTime
    )

    if (!currentShow) {
      Alert.alert("Error", "Selected show not found.")
      setIsLoading(false)
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
        .filter((id) => id !== undefined)

      if (seatIdsToReserve.length !== selectedSeats.length) {
        throw new Error("Some selected seats could not be found.")
      }

      const response = await fetch(
        "http://localhost:4000/seat/reserve-multiple",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seatIds: seatIdsToReserve,
            reservedBy: "60d5ecf7b7e1c20015a4a1b2", // Placeholder for actual user ID (a valid ObjectId string)
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        )
      }

      const result = await response.json()

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
      setError(err.message || "Failed to reserve seats.")
      Alert.alert(
        "Reservation Failed",
        err.message || "Failed to reserve seats."
      )
    } finally {
      setIsLoading(false)
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
