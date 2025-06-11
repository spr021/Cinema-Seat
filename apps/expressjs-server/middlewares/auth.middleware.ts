import { Request, Response, NextFunction } from "express"
import JWT from "jsonwebtoken"
import { promisify } from "util"

interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    roles: string[]
  }
}

// Define the expected signature for JWT.verify that promisify can handle
type JwtVerify = (
  token: string,
  secretOrPublicKey: JWT.Secret,
  options?: JWT.VerifyOptions
) => Promise<string | JWT.JwtPayload>

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1) Get token from header
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        message: "You are not logged in! Please log in to get access.",
      })
    }

    // 2) Verify token
    const verifyAsync = promisify(JWT.verify) as JwtVerify // Cast to the correct type
    const decoded = await verifyAsync(token, process.env.JWT_SECRET_KEY!)

    // 3) Add user to request
    req.user = decoded as unknown as {
      id: string
      email: string
      roles: string[]
    }
    next()
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token! Please log in again.",
    })
  }
}

export const authorizeRoles = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    const hasRequiredRole = roles.some((role) => req.user?.roles.includes(role))
    if (!hasRequiredRole) {
      return res.status(403).json({ message: "Insufficient permissions" })
    }

    next()
  }
}
