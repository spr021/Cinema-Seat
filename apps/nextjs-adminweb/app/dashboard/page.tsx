"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token")
        if (!token) {
          setError("No authentication token found.")
          return
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/ticket/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch stats")
        }
        setStats(await response.json())
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unknown error occurred")
        }
      }
    }

    fetchStats()
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
        {/* Tickets Overview */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Tickets Overview
            </h3>
            <p className="mt-2 text-sm text-gray-700">
              {stats
                ? `${stats.totalTickets.toLocaleString()} tickets sold across all shows.`
                : "Loading ticket data…"}
            </p>
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
      </div>
    </div>
  )
}
