import express, { Router } from "express"
import {
  register,
  login,
  getUser,
  protectedRoute,
  updateUserById,
  deleteUserById,
  getSession,
} from "../controllers/auth.controller"
import asyncMiddleware from "../middlewares/async"
import { authenticateToken, authorizeRoles } from "../middlewares/auth.middleware"

const router: Router = express.Router()

router.post("/register", asyncMiddleware(register))
router.get("/login", asyncMiddleware(login))
// router.get(protectedRoute, "/:id", asyncMiddleware(getUser))
router.put("/:id", asyncMiddleware(updateUserById))
router.delete("/:id", asyncMiddleware(deleteUserById))
router.get('/session', authenticateToken, authorizeRoles(['admin']),  asyncMiddleware(getSession));

export default router
