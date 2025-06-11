import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image, // Import Image
} from "react-native"
import { useTickets } from "@/hooks/useTickets" // Updated hook path
import { Ticket } from "@/types/ticket" // Updated type
import { format } from "date-fns"
import { useState } from "react"
import QRCode from "react-native-qrcode-svg" // Import QRCode
import LoginPrompt from "../auth/login-prompt"
import { useAuth } from "@/context/AuthContext"

function TicketItem({ ticket }: { ticket: Ticket }) {
  const [showQR, setShowQR] = useState(false)
  const showDate = format(new Date(ticket.show_id.date), "dd MMM yyyy") // Format date
  const showTime = format(new Date(ticket.show_id.date), "h:mm a") // Format time
  const seatDetails = ticket.seat_ids
    .map((seat) => `${seat.row}${seat.seatNumber}`) // Format seats
    .join(", ")

  return (
    <TouchableOpacity
      onPress={() => setShowQR(!showQR)}
      className="bg-white mb-4 rounded-lg shadow-xl overflow-hidden" // Adjusted styling
    >
      <View className="p-8">
        <Image
          source={{ uri: ticket.show_id.movie_id.img }} // Movie poster
          className="w-full h-48 rounded-md mb-4" // Image styling
          resizeMode="cover"
        />
        <Text className="text-2xl font-bold mb-2 text-gray-800">
          {ticket.show_id.movie_id.title}
        </Text>
        <View className="flex-row mb-4">
          {/* Display genre - assuming genre is a comma-separated string */}
          <Text className="text-gray-600 text-sm mr-2 border border-gray-400 rounded-full px-2 py-1">
            {ticket.show_id.movie_id.genre}
          </Text>
        </View>
        <View className="flex-row justify-between mb-4">
          <View>
            <Text className="text-gray-700 text-sm">Date</Text>
            <Text className="font-semibold text-base">{showDate}</Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-700 text-sm">Time</Text>
            <Text className="font-semibold text-base">{showTime}</Text>
          </View>
        </View>
        <View className="flex-row justify-between">
          <View>
            <Text className="text-gray-700 text-sm">Cinema</Text>
            <Text className="font-semibold text-base">
              {ticket.show_id.hall_id}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-gray-700 text-sm">Seat</Text>
            <Text className="font-semibold text-base">{seatDetails}</Text>
          </View>
        </View>
      </View>
      {/* Dashed line and holes */}
      <View className="relative">
        <View className="border-t-1 border-gray-300"></View>
        <View className="border-2 border-dashed border-white -mt-1"></View>
        <View className="absolute w-10 h-10 bg-gray-100 rounded-full -left-5 top-1/2 transform -translate-y-5"></View>
        <View className="absolute w-10 h-10 bg-gray-100 rounded-full -right-5 top-1/2 transform -translate-y-5"></View>
      </View>
      {showQR && (
        <View className="p-4 items-center">
          <View className="items-center p-4 border border-gray-300 rounded-lg bg-gray-50">
            {/* Replace with your actual API endpoint */}
            <QRCode
              value={`YOUR_API_ENDPOINT/tickets/validate/${ticket.reservation_id}`}
              size={180}
              color="black"
              backgroundColor="white"
            />
            <Text className="mt-4 text-center text-gray-700 text-sm">
              Booking Code:{" "}
              <Text className="font-semibold">{ticket.reservation_id._id}</Text>
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default function MyTicketsScreen() {
  const { token } = useAuth()
  const { tickets, isLoading, error } = useTickets()

  if (!token) {
    return <LoginPrompt />
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4">Loading tickets...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-red-500">
          Error loading tickets: {error.message}
        </Text>
      </View>
    )
  }

  if (tickets.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-5">
        <Text className="text-2xl font-bold mb-4">My Tickets</Text>
        <Text>You have no tickets yet.</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 p-5 mb-14">
      <FlatList
        data={tickets}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <TicketItem ticket={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  )
}
