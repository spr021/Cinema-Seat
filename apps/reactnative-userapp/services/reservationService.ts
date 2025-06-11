import { EXPO_PUBLIC_API_BASE_URL } from "@env"
import { Reservation } from "../types/reservation"

export async function fetchUserTickets(
  token: string | null
): Promise<Reservation[]> {
  try {
    console.log("Fetching user tickets with token:", token)

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/reservation/tickets`,
      {
        headers: {
          Authorization: `Bearer ${token ?? ""}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching user tickets:", error)
    throw error
  }
}

export async function createReservation(
  showId: string,
  seatIds: string[],
  userId: string,
  token: string | null
): Promise<{ success: boolean; message?: string; reservation?: Reservation }> {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/reservation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({
          show_id: showId, // Changed from 'show' to 'show_id'
          seat_ids: JSON.stringify(seatIds), // Backend expects a JSON string
          user_id: userId,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to create reservation.",
      }
    }

    return { success: true, reservation: data }
  } catch (error: any) {
    console.error("Error creating reservation:", error)
    return {
      success: false,
      message: error.message || "An unexpected error occurred.",
    }
  }
}

export async function markReservationAsPaid(
  reservationId: string,
  token: string | null
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/reservation/${reservationId}/pay`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to mark reservation as paid.",
      }
    }

    return {
      success: true,
      message: "Reservation marked as paid successfully.",
    }
  } catch (error: any) {
    console.error("Error marking reservation as paid:", error)
    return {
      success: false,
      message: error.message || "An unexpected error occurred.",
    }
  }
}
