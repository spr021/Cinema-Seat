import { Movie } from "./movie"

export interface User {
  _id: string
  // The login/register responses include `id` alongside `_id`
  id?: string
  name: string
  avatar?: string
  email: string
  roles?: string[]
  likes?: Movie[]
}
