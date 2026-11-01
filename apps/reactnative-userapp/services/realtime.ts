import { io, Socket } from "socket.io-client"

// One shared connection; seat maps are public read-only data
let socket: Socket | null = null

function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.EXPO_PUBLIC_API_BASE_URL ?? "", {
      transports: ["websocket"],
    })
  }
  return socket
}

export interface SeatsUpdateEvent {
  showId: string
  seats: import("@/components/select-ticket/types").Seat[]
}

/**
 * Subscribes to live seat updates for a show. Returns an unsubscribe fn.
 */
export function subscribeToShow(
  showId: string,
  onSeatsUpdate: (event: SeatsUpdateEvent) => void
): () => void {
  const client = getSocket()
  client.emit("join:show", showId)

  const handler = (event: SeatsUpdateEvent) => {
    if (event?.showId === showId) {
      onSeatsUpdate(event)
    }
  }
  client.on("seats:update", handler)

  return () => {
    client.emit("leave:show", showId)
    client.off("seats:update", handler)
  }
}
