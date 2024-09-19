import { model, Schema } from "mongoose"

const ShowSchema = new Schema(
  {
    date: {
      type: String,
      required: true,
    },
    seats: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Seat",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
)

export default model("Show", ShowSchema)
