import express, { Router } from "express"
import {
  createUser,
  getUser,
  updateUserById,
  deleteUserById,
} from "../controllers/user.controller"

const router: Router = express.Router()

router.post("/", createUser)
router.get("/:id", getUser)
router.put("/:id", updateUserById)
router.delete("/:id", deleteUserById)

export default router
