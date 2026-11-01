import "dotenv/config"
import mongoose from "mongoose"
import { createServer } from "http"
import app from "./app"
import { startHoldSweep } from "./jobs/hold-sweep"
import { initRealtime } from "./services/realtime"

const port = process.env.PORT || 4000

mongoose
  .connect(process.env.MONGO_DB_URL!)
  .then(() => {
    console.log("Connected to database")
    startHoldSweep()
    const server = createServer(app)
    initRealtime(server)
    server.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.log("Connecting to database failed")
    console.log(error)
  })
