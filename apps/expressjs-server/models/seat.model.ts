import { model, Schema } from "mongoose"

const SeatSchema = new Schema(
  {
    seatNumber: {
      type: String,
      required: true,
    },
    row: {
      type: String,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
    reservedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
)

export default model("Seat", SeatSchema)
