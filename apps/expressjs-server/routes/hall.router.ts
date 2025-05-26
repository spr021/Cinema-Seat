import express, { Router } from "express"
import {
  getHalls,
  getHallById,
} from "../controllers/hall.controller"
import asyncMiddleware from "../middlewares/async"

const router: Router = express.Router()

router.get("/", asyncMiddleware(getHalls))
router.get("/:id", asyncMiddleware(getHallById))

export default router
