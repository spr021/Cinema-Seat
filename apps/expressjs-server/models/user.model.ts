import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import validator from "validator"
import crypto from "crypto"

export interface IUser extends mongoose.Document {
  name: string
  avatar: string
  email: string
  password: string
  passwordConfirm?: string // Optional property, not saved in DB
  roles: string[]
  passwordResetToken?: string
  passwordResetExpires?: Date
  comparePassword(
    candidatePassword: string,
    hashedPassword: string
  ): Promise<boolean>
  createPasswordResetToken(): string
  likes: mongoose.Types.ObjectId[]
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      trim: true,
    },
    avatar: String,
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      validate: {
        validator: (email: string) => validator.isEmail(email),
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      validate: {
        // This only works on CREATE and SAVE
        validator: function (value: string) {
          return value === (this as IUser).password
        },
        message: "Passwords do not match",
      },
    },
    roles: {
      type: [String],
      default: ["user"],
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    likes: {
      type: [mongoose.Types.ObjectId],
      ref: "Movie",
    },
  },
  {
    timestamps: true,
  }
)

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  this.passwordConfirm = undefined!
  next()
})

UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, hashedPassword)
}

UserSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex")

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

  return resetToken
}

const User = mongoose.model<IUser>("User", UserSchema)

export default User
