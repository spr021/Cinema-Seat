import express, { Express, json, Request, Response, urlencoded } from "express"
import dotenv from "dotenv"
import movie from "./routes/movie.router"
import show from "./routes/show.router"
import seat from "./routes/seat.router"
import hall from "./routes/hall.router"
import auth from "./routes/auth.router"
import reservation from "./routes/reservation.router"
import ticket from "./routes/ticket.router" // Import the new ticket router
import mongoose from "mongoose"
import error from "./middlewares/error"
import cors from "cors"

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(json())
app.use(urlencoded({ extended: false }))
app.use("/movie", movie)
app.use("/show", show)
app.use("/seat", seat)
app.use("/hall", hall)
app.use("/reservation", reservation)
app.use("/ticket", ticket) // Register the new ticket router
app.use("/auth", auth)

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server")
})

app.use(error)

mongoose
  .connect(process.env.MONGO_DB_URL!)
  .then(() => {
    console.log("Connected to database")
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.log("Connecting to database failed")
    console.log(error)
  })
