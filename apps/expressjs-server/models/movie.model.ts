import { model, Schema } from "mongoose"

const MovieSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
    genre: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    shows: {
      type: [Schema.Types.ObjectId],
      ref: "Show",
    },
  },
  {
    timestamps: true,
  }
)

export default model("Movie", MovieSchema)
