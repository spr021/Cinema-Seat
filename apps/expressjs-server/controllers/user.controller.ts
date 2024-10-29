import { Request, Response } from "express"
import User from "../models/user.model"

const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body)
    res.status(200).json(user)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const getUser = async (req: Request, res: Response) => {
  const { id } = req.params
  const user = await User.findById(id)
  if (!user) {
    res.status(400).json({ message: "User not found" })
  }
  res.status(200).json(user)
  try {
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const updateUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    // cant update likes from here
    delete req.body.likes
    const user = await User.findByIdAndUpdate(id, req.body)
    if (!user) {
      res.status(400).json({ message: "User not found" })
    }
    const updatedUser = await User.findById(id)
    res.status(200).json(updatedUser)
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

const deleteUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)
    if (!user) {
      res.status(400).json({ message: "User not found" })
    }
    await User.findByIdAndDelete(id)
    res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message })
    }
  }
}

export { createUser, getUser, updateUserById, deleteUserById }
