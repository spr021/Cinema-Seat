import { useState, useEffect, useMemo } from "react"
import { Alert } from "react-native"
import { fetchShowsByMovieId, fetchShowDetails } from "@/services/showService"
import { getFormattedDate, getFormattedTime } from "@/utils/date"
import { useAuth } from "@/context/AuthContext"
import { subscribeToShow } from "@/services/realtime"
import { Show, Seat } from "@/components/select-ticket/types"

interface UseShowDataResult {
  selectedDate: string
  setSelectedDate: (date: string) => void
  selectedTime: string
  setSelectedTime: (time: string) => void
  availableDates: string[]
  availableTimes: string[]
  availableSeats: Seat[]
  isLoading: boolean
  error: string | null
  shows: Show[]
}

export function useShowData(movieId: string | string[]): UseShowDataResult {
  const { user } = useAuth()
  const userId = user ? String(user._id ?? user.id ?? "") : ""
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [shows, setShows] = useState<Show[]>([])
  const [error, setError] = useState<string | null>(null)

  const movieIdString = Array.isArray(movieId) ? movieId[0] : movieId

  useEffect(() => {
    async function fetchInitialShows() {
      if (!movieIdString) return

      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchShowsByMovieId(movieIdString)
        // Drop shows with corrupted dates so one bad row can't crash the screen
        const validShows = data.filter(
          (show) => !isNaN(new Date(show.date).getTime())
        )
        setShows(validShows)

        if (validShows.length > 0) {
          const firstDate = getFormattedDate(validShows[0].date)
          setSelectedDate(firstDate)
          const firstTimeForDate = validShows.find(
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

    fetchInitialShows()
  }, [movieIdString])

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
          const data = await fetchShowDetails(currentShow._id)

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
  }, [selectedDate, selectedTime, shows, isLoading])

  const availableDates = useMemo(
    () =>
      Array.from(
        new Set(shows.map((show) => getFormattedDate(show.date)))
      ).sort(),
    [shows]
  )

  const availableTimes = useMemo(
    () =>
      Array.from(
        new Set(
          shows
            .filter((show) => getFormattedDate(show.date) === selectedDate)
            .map((show) => getFormattedTime(show.date))
        )
      ).sort(),
    [shows, selectedDate]
  )

  const currentShowId = useMemo(
    () =>
      shows.find(
        (show) =>
          getFormattedDate(show.date) === selectedDate &&
          getFormattedTime(show.date) === selectedTime
      )?._id,
    [shows, selectedDate, selectedTime]
  )

  // Live seat map: subscribe while a specific show is selected
  useEffect(() => {
    if (!currentShowId) return
    const unsubscribe = subscribeToShow(currentShowId, ({ showId, seats }) => {
      setShows((prevShows) =>
        prevShows.map((show) =>
          show._id === showId ? { ...show, seats } : show
        )
      )
    })
    return unsubscribe
  }, [currentShowId])

  const availableSeats = useMemo(
    () =>
      (shows.find(
        (show) =>
          getFormattedDate(show.date) === selectedDate &&
          getFormattedTime(show.date) === selectedTime
      )?.seats || []).map((seat) => ({
        ...seat,
        // A seat actively held by another user is effectively taken
        isAvailable:
          seat.isAvailable &&
          !(
            seat.holdBy &&
            seat.holdUntil &&
            new Date(seat.holdUntil).getTime() > Date.now() &&
            String(seat.holdBy) !== userId
          ),
      })),
    [shows, selectedDate, selectedTime, userId]
  )

  return {
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    availableDates,
    availableTimes,
    availableSeats,
    isLoading,
    error,
    shows,
  }
}
