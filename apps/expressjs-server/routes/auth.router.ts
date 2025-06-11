import express, { Router } from "express"
import {
  register,
  login,
  getUser,
  protectedRoute,
  updateUserById,
  deleteUserById,
  getSession,
  getUserProfile,
  updateUserProfile,
  verifyPassword,
} from "../controllers/auth.controller"
import asyncMiddleware from "../middlewares/async"
import {
  authenticateToken,
  authorizeRoles,
} from "../middlewares/auth.middleware"

const router: Router = express.Router()

router.post("/register", asyncMiddleware(register))
router.post("/login", asyncMiddleware(login))

router.get("/profile", authenticateToken, asyncMiddleware(getUserProfile))
router.put("/profile", authenticateToken, asyncMiddleware(updateUserProfile))
router.post(
  "/verify-password",
  authenticateToken,
  asyncMiddleware(verifyPassword)
)

router.get("/:id", authenticateToken, asyncMiddleware(getUser))
router.put("/:id", authenticateToken, asyncMiddleware(updateUserById))
router.delete("/:id", authenticateToken, asyncMiddleware(deleteUserById))
router.get(
  "/session",
  authenticateToken,
  authorizeRoles(["admin"]),
  asyncMiddleware(getSession)
)

export default router
