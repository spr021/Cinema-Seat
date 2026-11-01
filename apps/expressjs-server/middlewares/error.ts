import { ErrorRequestHandler, Request, Response, NextFunction } from "express"
import { Error as MongooseError } from "mongoose"

export default function error(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(error) // Log the error for debugging

  // Mongoose schema validation failed (e.g. required field missing)
  if (error instanceof MongooseError.ValidationError) {
    const messages = Object.values(error.errors).map((err) => err.message)
    return res.status(400).json({ message: messages.join(". ") })
  }

  // Invalid ObjectId or value cast (e.g. malformed id in params)
  if (error instanceof MongooseError.CastError) {
    return res
      .status(400)
      .json({ message: `Invalid value for ${error.path}: ${error.value}` })
  }

  // MongoDB duplicate key (e.g. email already registered)
  if (typeof error === "object" && error !== null && "code" in error && (error as { code?: number }).code === 11000) {
    const keyValue = (error as { keyValue?: Record<string, unknown> }).keyValue
    const field = keyValue ? Object.keys(keyValue)[0] : "field"
    return res.status(409).json({
      message: `Duplicate value for ${field}: that ${field} is already in use`,
    })
  }

  res.status(500).json({ message: "Something went wrong" }) // Keep generic message for client
}
