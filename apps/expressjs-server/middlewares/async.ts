import { Request, Response, NextFunction } from "express"
//to do require('express-async-errors');

export default function asyncMiddleware(handler: Function) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res)
    } catch (error) {
      next(error)
    }
  }
}