import { ErrorRequestHandler, Request, Response, NextFunction } from "express"

export default function error(
  error: ErrorRequestHandler,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(500).json("Somthing went wrong")
}
