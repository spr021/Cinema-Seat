import express, { Express, json, Request, Response, urlencoded } from "express"
import movie from "./routes/movie.router"
import show from "./routes/show.router"
import seat from "./routes/seat.router"
import hall from "./routes/hall.router"
import auth from "./routes/auth.router"
import reservation from "./routes/reservation.router"
import ticket from "./routes/ticket.router"
import payment from "./routes/payment.router"
import error from "./middlewares/error"
import cors from "cors"

// Express app without database connection or listen, so tests can mount it
const app: Express = express()

app.use(cors())
// Stripe webhooks need the raw body for signature verification, so register
// the raw parser for that path before the general JSON parser
app.use("/payments/webhook", express.raw({ type: "application/json" }))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use("/movie", movie)
app.use("/show", show)
app.use("/seat", seat)
app.use("/hall", hall)
app.use("/reservation", reservation)
app.use("/ticket", ticket)
app.use("/payments", payment)
app.use("/auth", auth)

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server")
})

app.use(error)

export default app
