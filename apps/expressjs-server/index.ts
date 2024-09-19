import express, { Express, json, Request, Response, urlencoded } from "express"
import dotenv from "dotenv"
import movie from "./routes/movie.router"
import show from "./routes/show.router"
import mongoose from "mongoose"

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 4000

app.use(json())
app.use(urlencoded({ extended: false }))
app.use("/movie", movie)
app.use("/show", show)

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server")
})

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
