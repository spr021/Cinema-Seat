import { Movie } from "./movie"

export interface User {
  _id: string
  name: string
  avatar?: string
  email: string
  likes?: Movie[]
}
