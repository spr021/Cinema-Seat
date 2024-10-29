import { model, Schema } from "mongoose"

const UserSchema = new Schema(
  {
    name: String,
    avatar: String,
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: "Movie",
    },
  },
  {
    timestamps: true,
  }
)

export default model("User", UserSchema)
