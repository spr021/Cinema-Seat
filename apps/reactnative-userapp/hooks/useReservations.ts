import { useState, useEffect } from "react"
import { fetchUserTickets } from "@/services/reservationService"
import { Reservation } from "@/types/reservation"
import { useAuth } from "@/context/AuthContext"

export function useTickets() {
  const [tickets, setTickets] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { token } = useAuth()

  useEffect(() => {
    async function loadTickets() {
      try {
        const data = await fetchUserTickets(token)
        setTickets(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTickets()
  }, [token])

  return { tickets, isLoading, error }
}
