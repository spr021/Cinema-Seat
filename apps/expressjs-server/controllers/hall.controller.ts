import { Request, Response } from "express"
import { layout1 } from "../constant/seat.layout"

const getHalls = (req: Request, res: Response) => {
  const halls = [layout1]
  res.status(200).json(halls)
}

const getHallById = async (req: Request, res: Response) => {
  const { id } = req.params
  let hall = null
  switch (id) {
    case "1":
      hall = layout1
      break
    default:
      return res.status(400).json({ message: "Hall not found" })
  }
  res.status(200).json(hall)
}

export { getHalls, getHallById }
