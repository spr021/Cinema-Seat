import { model, Schema } from "mongoose"

const ReservationSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seat_ids: {
      type: [Schema.Types.ObjectId],
      ref: "Seat",
      required: true,
    },
    show_id: {
      type: Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    is_paid: {
      type: Boolean,
      default: false,
      required: true,
    },
    // Stripe checkout session for this reservation, when paid via Stripe
    checkout_session_id: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export default model("Reservation", ReservationSchema)
