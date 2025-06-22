import React from "react"

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large"
  color?: string
}

function LoadingSpinner({
  size = "medium",
  color = "border-blue-500",
}: LoadingSpinnerProps) {
  const spinnerSize = {
    small: "h-8 w-8",
    medium: "h-12 w-12",
    large: "h-16 w-16",
  }

  return (
    <div
      className={`animate-spin rounded-full ${spinnerSize[size]} border-t-4 border-solid ${color} border-opacity-75`}
    ></div>
  )
}

export { LoadingSpinner }
