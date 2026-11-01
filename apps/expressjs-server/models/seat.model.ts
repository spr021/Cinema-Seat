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
    // Temporary hold while the user is on the payment screen
    holdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    holdUntil: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

export default model("Seat", SeatSchema)
