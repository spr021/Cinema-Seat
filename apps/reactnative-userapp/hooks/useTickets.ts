import { useState, useEffect } from "react"
import { fetchUserTickets } from "@/services/ticketService" // Updated import
import { Ticket } from "@/types/ticket" // Updated type
import { useAuth } from "@/context/AuthContext"

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]) // Updated state type
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
    if (token) {
      loadTickets()
    }
  }, [token])

  return { tickets, isLoading, error }
}
