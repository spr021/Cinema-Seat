import "dotenv/config"
import mongoose from "mongoose"
import app from "./app"
import { startHoldSweep } from "./jobs/hold-sweep"

const port = process.env.PORT || 4000

mongoose
  .connect(process.env.MONGO_DB_URL!)
  .then(() => {
    console.log("Connected to database")
    startHoldSweep()
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`)
    })
  })
  .catch((error) => {
    console.log("Connecting to database failed")
    console.log(error)
  })
