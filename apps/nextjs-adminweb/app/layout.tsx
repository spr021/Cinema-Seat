"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import "./globals.css"
import { Inter } from "next/font/google"
import { LoadingSpinner } from "./components/LoadingSpinner"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const publicPaths = [
    "/auth/login",
    "/auth/forgot-password",
    "/auth/reset-password",
  ]

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token")

      if (!token && !publicPaths.includes(pathname)) {
        router.push("/auth/login")
        setIsLoading(false)
        return
      }

      if (token) {
        try {
          const BASE_URL = "http://localhost:4000/auth"
          const sessionResponse = await fetch(`${BASE_URL}/session`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })

          const sessionData = await sessionResponse.json()

          if (
            sessionResponse.ok &&
            sessionData.user &&
            sessionData.user.roles.includes("admin")
          ) {
            // If on a public path and authenticated, redirect to dashboard
            if (publicPaths.includes(pathname)) {
              router.push("/dashboard")
            }
          } else {
            // Token is invalid or user is not admin, clear token and redirect to login
            localStorage.removeItem("token")
            sessionStorage.removeItem("token")
            if (!publicPaths.includes(pathname)) {
              router.push("/auth/login")
            }
          }
        } catch (error) {
          // Error during token validation, clear token and redirect to login
          localStorage.removeItem("token")
          sessionStorage.removeItem("token")
          if (!publicPaths.includes(pathname)) {
            router.push("/auth/login")
          }
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [router, pathname])

  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className={`${inter.className} h-full`}>
        {isLoading && !publicPaths.includes(pathname) ? (
          <div className="flex h-full items-center justify-center">
            <LoadingSpinner size="large" color="border-indigo-600" />
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  )
}
