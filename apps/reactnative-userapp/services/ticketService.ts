import { Ticket } from "../types/ticket"

export async function fetchUserTickets(
  token: string | null
): Promise<Ticket[]> {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_BASE_URL}/ticket/list`,
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
