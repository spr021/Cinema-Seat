import { NextFunction, Request, Response } from "express"
import { promisify } from "util"
import JWT, { SignOptions } from "jsonwebtoken"
import User, { IUser } from "../models/user.model"
import bcrypt from 'bcryptjs'

const signToken = (id: string, email: string) => {
  const options: SignOptions = {
    expiresIn: 3600 // 1 hour in seconds
  }
  return JWT.sign(
    {
      id,
      email,
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
  })

  const token = signToken(user.id, user.email)
  res.status(200).json({
    data: user,
    token,
  })
}

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: "Enter email and password" })
    }
    const user: IUser = await User.findOne({ email }).select("+password")
    if (!user || !user.comparePassword(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" })
    }
    const token = signToken(user.id, user.email)
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
    const decoded = await promisify(JWT.verify)(
      token,
      // process.env.JWT_SECRET_KEY!
    )

    console.log(decoded)

    // const freshUser = await User.findById(decoded)
    // if(!freshUser) {
    //   return next()
    // }
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
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const decoded = JWT.verify(token, process.env.JWT_SECRET_KEY!) as {
      id: string
      email: string
      roles: string[]
    }

    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles,
      },
    })
}

export {
  register,
  login,
  protectedRoute,
  getUser,
  updateUserById,
  deleteUserById,
  getSession,
}
