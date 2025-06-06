import { ErrorRequestHandler, Request, Response, NextFunction } from "express"

export default function error(
  error: ErrorRequestHandler,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(error) // Log the error for debugging
  res.status(500).json("Somthing went wrong") // Keep generic message for client
}
