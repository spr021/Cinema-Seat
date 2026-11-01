import { Server as HttpServer } from "http"
import { Server as SocketServer, Socket } from "socket.io"
import Show from "../models/show.model"

let io: SocketServer | null = null

/**
 * Attaches a Socket.io server to the HTTP server. Clients join a per-show
 * room and receive `seats:update` events whenever seat state changes.
 */
export function initRealtime(server: HttpServer) {
  io = new SocketServer(server, {
    cors: { origin: "*" }, // seat maps are public read-only data
  })

  io.on("connection", (socket: Socket) => {
    socket.on("join:show", async (showId: string) => {
      if (!showId || typeof showId !== "string") return
      socket.join(`show:${showId}`)
      // Send the freshest seat state right away so late joiners sync up
      const show = await Show.findById(showId).populate("seats")
      if (show) {
        socket.emit("seats:update", { showId, seats: show.seats })
      }
    })

    socket.on("leave:show", (showId: string) => {
      if (!showId || typeof showId !== "string") return
      socket.leave(`show:${showId}`)
    })
  })

  return io
}

/** Push the current seats of a show to everyone in its room. */
export async function broadcastSeats(showId: string) {
  if (!io) return
  const show = await Show.findById(showId).populate("seats")
  if (!show) return
  io.to(`show:${showId}`).emit("seats:update", { showId, seats: show.seats })
}

/**
 * Broadcast every show that contains any of the given seats. Controllers
 * know seat ids but not the show, and seats can theoretically appear in
 * multiple shows' room flows, so resolve shows from the seat ids.
 */
export async function broadcastSeatsForSeatIds(seatIds: (string | unknown)[]) {
  if (!io || seatIds.length === 0) return
  const shows = await Show.find({ seats: { $in: seatIds } }).select("_id")
  for (const show of shows) {
    await broadcastSeats(String(show._id))
  }
}
