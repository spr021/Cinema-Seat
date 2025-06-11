"use client"

import { useRef, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import listPlugin from "@fullcalendar/list"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useEffect } from "react"
import { format, parseISO, formatISO } from "date-fns"
import type { EventContentArg } from "@fullcalendar/core"
import "../../styles/full-calendar.css"

interface Show {
  _id: string
  date: string
  movieId: string
  hallId: string
  price: number
}

interface Movie {
  _id: string
  title: string
  duration: number // in minutes
  color: string
}

interface Hall {
  id: string
  name: string
  capacity: number
  color: string
  price: number
  seats: []
}

export default function Shows() {
  const calendarRef = useRef<FullCalendar | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [shows, setShows] = useState<Show[]>([])
  const [movies, setMovies] = useState<Movie[]>([])
  const [halls, setHalls] = useState<Hall[]>([])
  const [newShow, setNewShow] = useState({
    movieId: "",
    hallId: "",
    start: "",
    price: 0,
    end: "",
  })

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://localhost:4000/movie")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setMovies(data)
      } catch (error) {
        console.error("Could not fetch movies:", error)
      }
    }

    const fetchHalls = async () => {
      try {
        const response = await fetch("http://localhost:4000/hall")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setHalls(data)
      } catch (error) {
        console.error("Could not fetch halls:", error)
      }
    }

    fetchMovies()
    fetchHalls()
  }, [])

  const fetchShows = async (start?: string, end?: string) => {
    let url = "http://localhost:4000/show/list"

    if (start && end) {
      const encodedStart = encodeURIComponent(start)
      const encodedEnd = encodeURIComponent(end)
      url += `?start=${encodedStart}&end=${encodedEnd}`
    }

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      for (const show of data) {
        show.date = parseISO(show.date).toISOString()
      }

      setShows(data)
    } catch (error) {
      console.error("Could not fetch shows:", error)
    }
  }

  useEffect(() => {
    // Initial fetch for shows when component mounts
    // fetchShows()
  }, []) // Dependency array includes fetchShows to avoid lint warnings, though it's stable

  const handleDateSelect = (selectInfo: { start: Date; end: Date }) => {
    setSelectedDate(selectInfo.start)

    setNewShow({
      ...newShow,
      movieId: "",
      hallId: "",
      price: 0,
      start: formatISO(selectInfo.start, { representation: "complete" }),
      end: formatISO(selectInfo.end, { representation: "complete" }),
    })

    setIsModalOpen(true)
  }

  const handleEditShow = async (showId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/show/${showId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: newShow.start,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setShows(shows.map((show) => (show._id === showId ? data : show)))
    } catch (error) {
      console.error("Could not update show:", error)
    }
  }

  const handleDeleteShow = async (showId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/show/${showId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setShows(shows.filter((show) => show._id !== showId))
    } catch (error) {
      console.error("Could not delete show:", error)
    }
  }

  const handleCreateShow = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/show/create/${newShow.movieId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: newShow.start,
            hall_id: newShow.hallId,
            movie_id: newShow.movieId,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setShows([...shows, data])

      setIsModalOpen(false)
      setNewShow({
        movieId: "",
        hallId: "",
        start: "",
        price: 0,
        end: "",
      })
    } catch (error) {
      console.error("Could not create show:", error)
    }
  }

  const renderEventContent = (eventInfo: EventContentArg) => {
    const hall = halls.find(
      (hall) => hall.id === eventInfo.event._def.extendedProps.hallId
    )
    const backgroundColor = hall && hall.color

    return (
      <div className="p-1 overflow-hidden h-full" style={{ backgroundColor }}>
        <div className="font-medium text-sm text-white truncate">
          {eventInfo.event._def.extendedProps.title}
        </div>
        <div className="text-xs text-white/90 truncate">
          {eventInfo.timeText} • Hall 1
        </div>
        <button
          className="text-red-500 hover:text-red-700"
          onClick={() =>
            handleDeleteShow(eventInfo.event._def.extendedProps._id)
          }
        >
          Delete
        </button>
        <button
          className="text-blue-500 hover:text-blue-700"
          onClick={() => handleEditShow(eventInfo.event._def.extendedProps._id)}
        >
          Edit
        </button>
      </div>
    )
  }

  const handleDatesSet = (datesSetInfo: {
    startStr: string
    endStr: string
  }) => {
    fetchShows(datesSetInfo.startStr, datesSetInfo.endStr)
  }

  const customButtons = {
    prev: {
      icon: "chevron-left",
      click: () => {
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi()
          calendarApi?.prev()
        }
      },
    },
    next: {
      icon: "chevron-right",
      click: () => {
        if (calendarRef.current) {
          const calendarApi = calendarRef.current.getApi()
          calendarApi?.next()
        }
      },
    },
  }

  return (
    <div className="h-full">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            initialView="timeGridWeek"
            customButtons={customButtons}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            weekends={true}
            events={shows}
            select={handleDateSelect}
            datesSet={handleDatesSet} // Add this prop
            height="calc(100vh - 200px)"
            slotMinTime="11:00:00"
            slotMaxTime="24:00:00"
            allDaySlot={false}
            slotDuration="01:00:00"
            eventContent={renderEventContent}
            nowIndicator={true}
            dayHeaderFormat={{
              weekday: "short",
              month: "numeric",
              day: "numeric",
              omitCommas: true,
            }}
            slotLabelFormat={{
              hour: "numeric",
              minute: "2-digit",
            }}
            expandRows={true}
            stickyHeaderDates={true}
            views={{
              timeGridWeek: {
                dayHeaderContent: (args: any) => {
                  const date = args.date
                  const today = new Date()
                  const isToday = date.toDateString() === today.toDateString()
                  return (
                    <div
                      className={`text-center py-1 ${isToday ? "text-indigo-600 font-bold" : ""}`}
                    >
                      <div className="text-xs uppercase">
                        {format(date, "EEE")}
                      </div>
                      <div className="text-lg">{format(date, "d")}</div>
                    </div>
                  )
                },
              },
            }}
          />
        </div>
      </div>

      <Transition show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900 mb-6"
                  >
                    Create New Show
                  </Dialog.Title>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Movie
                      </label>
                      <select
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={newShow.movieId}
                        onChange={(e) => {
                          setNewShow({ ...newShow, movieId: e.target.value })
                        }}
                      >
                        <option value="">Select a movie</option>
                        {movies.map((movie) => (
                          <option key={movie._id} value={movie._id}>
                            {movie.title} ({movie.duration} min)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hall
                      </label>
                      <select
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={newShow.hallId}
                        onChange={(e) =>
                          setNewShow({
                            ...newShow,
                            hallId: e.target.value,
                            price:
                              halls.find((hall) => hall.id === e.target.value)
                                ?.price || 0,
                          })
                        }
                      >
                        <option value="">Select a hall</option>
                        {halls.map((hall) => (
                          <option key={hall.id} value={hall.id}>
                            {hall.name} (Capacity: {hall.capacity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price of each seat{" "}
                        {
                          halls.find((hall) => hall.id === newShow.hallId)
                            ?.price
                        }
                        $
                      </label>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={handleCreateShow}
                      >
                        Create Show
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
