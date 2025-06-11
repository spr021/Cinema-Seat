import { Document, Types } from "mongoose"
import { model, Schema } from "mongoose"

export interface ITicket extends Document {
  user_id: Types.ObjectId
  show_id: Types.ObjectId
  seat_ids: Types.ObjectId[]
  reservation_id: Types.ObjectId
  purchase_date: Date
  price: number
}

const TicketSchema: Schema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  show_id: { type: Schema.Types.ObjectId, ref: "Show", required: true },
  seat_ids: [{ type: Schema.Types.ObjectId, ref: "Seat", required: true }],
  reservation_id: {
    type: Schema.Types.ObjectId,
    ref: "Reservation",
    required: true,
    unique: true,
  },
  purchase_date: { type: Date, default: Date.now },
  price: { type: Number, required: true },
})

export default model("Ticket", TicketSchema)
