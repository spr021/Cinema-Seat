export function getFormattedDate(dateString: string): string {
  const date = new Date(dateString)
  // A single corrupted date in the database must never crash a whole screen
  if (isNaN(date.getTime())) return ""
  return date.toISOString().split("T")[0] // Extracts YYYY-MM-DD
}

export function getFormattedTime(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ""
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}
