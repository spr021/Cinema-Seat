import { NextFunction, Request, Response } from "express"
import { promisify } from "util"
import JWT, { SignOptions } from "jsonwebtoken"
import User, { IUser } from "../models/user.model"
import { Request as ExpressRequest } from "express"
import mongoose from "mongoose"
import sendEmail from "../utils/email"
import crypto from "crypto"

interface AuthenticatedRequest extends ExpressRequest {
  user?: {
    id: string
    email: string
    roles: string[]
  }
}

const signToken = (id: string, email: string, roles: string[]) => {
  const options: SignOptions = {
    expiresIn: 60 * 60 * 24 * 10, // 10 day
    algorithm: "HS256", // Specify the algorithm
  }
  return JWT.sign(
    {
      id,
      email,
      roles,
    },
    process.env.JWT_SECRET_KEY!,
    options
  )
}

const register = async (req: Request, res: Response) => {
  const { name, email, password, passwordConfirm, avatar } = req.body
  const user = await User.create({
    name,
    email,
    avatar,
    password,
    passwordConfirm,
    roles: ["user"], // Default role
  })

  const token = signToken(user.id, user.email, user.roles)
  res.status(200).json({
    data: user,
    token,
  })
}

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email })
  if (!user) {
    return res
      .status(404)
      .json({ message: "There is no user with that email address." })
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  // 3) Send it to user's email
  const resetURL = `${req.get("origin")}/auth/reset-password?token=${resetToken}`

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`

  try {
    // Use when setup SMTP service
    // await sendEmail({
    //   email: user.email,
    //   subject: "Your password reset token (valid for 10 min)",
    //   message,
    // })

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
      // For testing purposes, we return the reset URL
      data: {
        email: user.email,
        subject: "Your password reset token (valid for 10 min)",
        title: "Use this link to reset your password",
        resetURL,
        message,
      },
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    return res.status(500).json({
      message: "There was an error sending the email. Try again later!",
    })
  }
}

// @desc    Reset password
// @route   PATCH /api/v1/auth/reset-password/:token
// @access  Public
const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return res.status(400).json({ message: "Token is invalid or has expired" })
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  await user.save()

  // 3) Log the user in, send JWT
  const token = signToken(user.id, user.email, user.roles)

  res.status(200).json({
    status: "success",
    token,
  })
}

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ message: "Enter email and password" })
  }
  const user: IUser = await User.findOne({ email }).select("+password")
  if (!user || !(await user.comparePassword(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" })
  }
  const token = signToken(user.id, user.email, user.roles)
  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      roles: user.roles,
    },
    token,
  })
}

const protectedRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return next()
    }
    JWT.verify(token, process.env.JWT_SECRET_KEY!, {}, (error, callback) => {})
    const decoded = await promisify(JWT.verify)(token)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
  next()
}

const getUser = async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await User.findById(id)
  if (!user) {
    res.status(400).json({ message: "User not found" })
  }
  res.status(200).json(user)
}

const updateUserById = async (req: Request, res: Response) => {
  const { id } = req.params
  // cant update likes from here
  delete req.body.likes
  const user = await User.findByIdAndUpdate(id, req.body)
  if (!user) {
    res.status(400).json({ message: "User not found" })
  }
  const updatedUser = await User.findById(id)
  res.status(200).json(updatedUser)
}

const deleteUserById = async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await User.findById(id)
  if (!user) {
    res.status(400).json({ message: "User not found" })
  }
  await User.findByIdAndDelete(id)
  res.status(200).json({ message: "User deleted successfully" })
}

const getSession = async (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) {
    return res.status(401).json({ message: "No token provided" })
  }

  const decoded = JWT.verify(token, process.env.JWT_SECRET_KEY!) as {
    id: string
    email: string
    roles: string[]
  }

  const user = await User.findById(decoded.id)
  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      roles: user.roles,
    },
  })
}

// @desc    Get user profile
// @route   GET /api/v1/auth/profile
// @access  Private
const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" })
  }

  const user = await User.findById(req.user.id)
    .select("-password")
    // populate likes with movie details
    .populate({
      path: "likes",
      select: "-shows",
    })

  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  res.status(200).json({
    success: true,
    data: user,
  })
}

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
const updateUserProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Filter out unwanted fields that should not be updated by the user directly
  const filteredBody: { [key: string]: any } = { ...req.body }
  delete filteredBody.passwordConfirm
  delete filteredBody.likes
  delete filteredBody.roles // Roles should not be updated by user

  const user = await User.findById(req.user?.id)

  if (!user) {
    return next(new Error("User not found")) // Use next for error handling
  }

  // Update user properties
  if (filteredBody.name) user.name = filteredBody.name
  if (filteredBody.email) user.email = filteredBody.email
  if (filteredBody.avatar) user.avatar = filteredBody.avatar

  // Handle password update separately to trigger pre-save hook
  if (filteredBody.password) {
    user.password = filteredBody.password
  }

  const updatedUser = await user.save()

  res.status(200).json({
    success: true,
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      roles: updatedUser.roles,
    },
  })
}

// @desc    Verify current password
// @route   POST /api/v1/auth/verify-password
// @access  Private
const verifyPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword } = req.body

  if (!req.user?.id) {
    return res.status(401).json({ message: "User not authenticated" })
  }

  if (!currentPassword) {
    return res.status(400).json({ message: "Current password is required" })
  }

  const user = await User.findById(req.user.id).select("+password")

  if (!user || !(await user.comparePassword(currentPassword, user.password))) {
    return res.status(401).json({ message: "Invalid current password" })
  }

  res
    .status(200)
    .json({ success: true, message: "Current password verified successfully" })
}

// @desc    Toggle movie like
// @route   POST /api/v1/auth/toggle-movie-like
// @access  Private
const toggleMovieLike = async (req: AuthenticatedRequest, res: Response) => {
  const { movieId } = req.body

  if (!req.user?.id) {
    return res.status(401).json({ message: "User not authenticated" })
  }

  if (!movieId) {
    return res.status(400).json({ message: "Movie ID is required" })
  }

  const user = await User.findById(req.user.id)

  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  const movieObjectId = new mongoose.Types.ObjectId(movieId)

  const isLiked = user.likes.includes(movieObjectId)

  if (isLiked) {
    user.likes = user.likes.filter((id) => !id.equals(movieObjectId))
  } else {
    user.likes.push(movieObjectId)
  }

  await user.save()

  // Populate the likes array with full movie objects
  await user.populate({
    path: "likes",
    select: "-shows",
  })

  res.status(200).json({
    success: true,
    data: user.likes,
    message: isLiked
      ? "Movie unliked successfully"
      : "Movie liked successfully",
  })
}

// @desc    Get all users
// @route   GET /api/v1/auth/users
// @access  Private/Admin
const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find().select("-password") // Exclude password field
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    })
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message })
    }
    res.status(500).json({ message: "An unknown error occurred" })
  }
}

export {
  register,
  login,
  protectedRoute,
  getUser,
  updateUserById,
  deleteUserById,
  getSession,
  getUserProfile,
  updateUserProfile,
  verifyPassword,
  toggleMovieLike,
  forgotPassword,
  resetPassword,
  getUsers,
}
