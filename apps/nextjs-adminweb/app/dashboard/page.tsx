"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import {
  UsersIcon,
  VideoCameraIcon,
  CalendarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline"

interface Stats {
  totalUsers: number
  totalMovies: number
  totalShows: number
  totalTickets: number
  totalRevenue: number
}

interface RevenuePoint {
  day: string
  revenue: number
  tickets: number
}

interface TopMovie {
  title: string
  ticketsSold: number
  revenue: number
}

interface OccupancyPoint {
  showId: string
  date: string
  totalSeats: number
  takenSeats: number
}

interface Analytics {
  revenueByDay: RevenuePoint[]
  topMovies: TopMovie[]
  occupancy: OccupancyPoint[]
}

const statsConfig = [
  { key: "totalUsers", name: "Total Users", icon: UsersIcon },
  { key: "totalMovies", name: "Total Movies", icon: VideoCameraIcon },
  { key: "totalShows", name: "Total Shows", icon: CalendarIcon },
  { key: "totalRevenue", name: "Revenue", icon: CurrencyDollarIcon },
] as const

const quickActions = [
  { name: "Add New Movie", href: "/dashboard/movies" },
  { name: "Create New Show", href: "/dashboard/shows" },
  { name: "Manage Users", href: "/dashboard/users" },
]

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token")
        if (!token) {
          setError("No authentication token found.")
          return
        }

        const headers = { Authorization: `Bearer ${token}` }
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL

        const [statsResponse, analyticsResponse] = await Promise.all([
          fetch(`${apiBase}/ticket/stats`, { headers }),
          fetch(`${apiBase}/ticket/analytics`, { headers }),
        ])

        if (!statsResponse.ok) {
          const errorData = await statsResponse.json()
          throw new Error(errorData.message || "Failed to fetch stats")
        }
        setStats(await statsResponse.json())

        if (analyticsResponse.ok) {
          setAnalytics(await analyticsResponse.json())
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unknown error occurred")
        }
      }
    }

    fetchAdminData()
  }, [])

  const formatValue = (key: (typeof statsConfig)[number]["key"]) => {
    if (!stats) return "…"
    if (key === "totalRevenue") {
      return `$${stats.totalRevenue.toLocaleString()}`
    }
    return String(stats[key])
  }

  return (
    <div>
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
        {statsConfig.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center gap-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50">
                <stat.icon
                  className="h-6 w-6 text-indigo-600"
                  aria-hidden="true"
                />
              </div>
              <div>
                <p className="text-sm font-medium leading-6 text-gray-600">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold tracking-tight text-gray-900">
                  {formatValue(stat.key)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Revenue over time */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Revenue (last 30 days)
          </h3>
          <div className="mt-4 h-64">
            {analytics && analytics.revenueByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(day: string) => day.slice(5)}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Revenue"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="pt-20 text-center text-sm text-gray-500">
                No sales in the last 30 days yet.
              </p>
            )}
          </div>
        </div>

        {/* Top movies */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Top movies (tickets sold)
          </h3>
          <div className="mt-4 h-64">
            {analytics && analytics.topMovies.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topMovies} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="ticketsSold"
                    fill="#4f46e5"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="pt-20 text-center text-sm text-gray-500">
                No tickets sold yet.
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Quick Actions
            </h3>
            <div className="mt-6 grid grid-cols-1 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  {action.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Show occupancy */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Show occupancy
            </h3>
            <div className="mt-4 flow-root">
              {analytics && analytics.occupancy.length > 0 ? (
                <ul role="list" className="-my-2 divide-y divide-gray-200">
                  {analytics.occupancy.map((show) => {
                    const pct =
                      show.totalSeats > 0
                        ? Math.round((show.takenSeats / show.totalSeats) * 100)
                        : 0
                    return (
                      <li key={show.showId} className="py-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-900">
                            {show.date
                              ? new Date(show.date).toLocaleString([], {
                                  dateStyle: "medium",
                                  timeStyle: "short",
                                })
                              : "Show"}
                          </span>
                          <span className="text-gray-500">
                            {show.takenSeats}/{show.totalSeats} seats
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full bg-indigo-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-gray-500">
                  No shows created yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
