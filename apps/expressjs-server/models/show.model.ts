import { model, Schema } from "mongoose"

const ShowSchema = new Schema(
  {
    date: {
      type: String,
      required: true,
    },
    seats: {
      type: [Schema.Types.ObjectId],
      ref: "Seat",
    },
    movie_id: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    hall_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

export default model("Show", ShowSchema)
