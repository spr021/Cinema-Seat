import { Show, Seat } from "@/components/select-ticket/types"

export async function fetchShowsByMovieId(movieId: string): Promise<Show[]> {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/show/list/${movieId}`
  )
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function fetchShowDetails(showId: string): Promise<Show> {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/show/${showId}`
  )
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export async function reserveSeats(
  seatIds: string[],
  reservedBy: string
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/seat/reserve-multiple`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        seatIds,
        reservedBy,
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    )
  }

  return response.json()
}

// Hold seats (10 min) for the logged-in user while they complete payment
export async function holdSeats(
  token: string,
  seatIds: string[]
): Promise<{ success: boolean; message?: string; holdUntil?: string }> {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/seat/hold`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ seatIds }),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    return {
      success: false,
      message: data.message || `HTTP error! status: ${response.status}`,
    }
  }
  return data
}

export async function releaseHeldSeats(
  token: string,
  seatIds: string[]
): Promise<{ success: boolean; message?: string }> {
  const response = await fetch(
    `${process.env.EXPO_PUBLIC_API_BASE_URL}/seat/release`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ seatIds }),
    }
  )

  const data = await response.json()
  if (!response.ok) {
    return {
      success: false,
      message: data.message || `HTTP error! status: ${response.status}`,
    }
  }
  return data
}
