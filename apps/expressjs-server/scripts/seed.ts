/**
 * Seeds demo data so anyone can test the platform immediately:
 *   - two accounts (admin + customer) with known credentials
 *   - a few movies and one screened show with seats (only if missing)
 *
 * Idempotent: running it twice does not duplicate anything.
 *
 * Usage: yarn seed   (from apps/expressjs-server, with MONGO_DB_URL set)
 */
import "dotenv/config"
import mongoose from "mongoose"
import User from "../models/user.model"
import Movie from "../models/movie.model"
import Show from "../models/show.model"
import Seat from "../models/seat.model"
import { layout1 } from "../constant/seat.layout"

const DEMO_ADMIN = {
  name: "Demo Admin",
  email: "admin@cinema.test",
  password: "admin12345",
  roles: ["user", "admin"],
}

const DEMO_USER = {
  name: "Demo User",
  email: "user@cinema.test",
  password: "user12345",
  roles: ["user"],
}

const DEMO_MOVIES = [
  {
    title: "Demo Movie One",
    img: "https://picsum.photos/seed/cinema1/400/600",
    genre: "Sci-Fi",
    duration: 130,
    year: "2025",
    rating: 8.1,
    summary: "A seeded demo movie so a fresh install has something to book.",
    director: "Demo Director",
    actors: ["Demo Actor", "Another Actor"],
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    title: "Demo Movie Two",
    img: "https://picsum.photos/seed/cinema2/400/600",
    genre: "Drama",
    duration: 110,
    year: "2024",
    rating: 7.4,
    summary: "Another seeded demo movie.",
    director: "Demo Director",
    actors: ["Demo Actor"],
    trailerUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
]

async function seed() {
  if (!process.env.MONGO_DB_URL) {
    throw new Error("MONGO_DB_URL is not set (check apps/expressjs-server/.env)")
  }
  await mongoose.connect(process.env.MONGO_DB_URL)
  console.log("Connected to database")

  // --- Users (upsert by email) ---
  for (const account of [DEMO_ADMIN, DEMO_USER]) {
    const existing = await User.findOne({ email: account.email })
    if (existing) {
      console.log(`user exists: ${account.email}`)
      continue
    }
    await User.create({ ...account, passwordConfirm: account.password })
    console.log(`user created: ${account.email} / ${account.password}`)
  }

  // --- Movies (upsert by title) ---
  for (const movieData of DEMO_MOVIES) {
    const existing = await Movie.findOne({ title: movieData.title })
    if (existing) {
      console.log(`movie exists: ${movieData.title}`)
      continue
    }
    await Movie.create(movieData)
    console.log(`movie created: ${movieData.title}`)
  }

  // --- One screened show for the first demo movie (only if it has none) ---
  const firstMovie = await Movie.findOne({ title: DEMO_MOVIES[0].title })
  if (firstMovie && (!firstMovie.shows || firstMovie.shows.length === 0)) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    tomorrow.setUTCHours(19, 0, 0, 0)
    const seats = await Seat.insertMany(layout1.seats)
    const show = await Show.create({
      date: tomorrow.toISOString(),
      seats,
      movie_id: firstMovie._id,
      hall_id: "1",
    })
    firstMovie.shows = [show._id as mongoose.Types.ObjectId]
    await firstMovie.save()
    console.log(`show created for ${firstMovie.title} at ${show.date}`)
  } else if (firstMovie) {
    console.log(`show exists for: ${firstMovie.title}`)
  }

  console.log("\n=== Demo accounts ===")
  console.log(`Admin panel (http://localhost:3000): ${DEMO_ADMIN.email} / ${DEMO_ADMIN.password}`)
  console.log(`Customer app:                          ${DEMO_USER.email} / ${DEMO_USER.password}`)

  await mongoose.disconnect()
}

seed().catch((error) => {
  console.error("Seeding failed:", error)
  process.exit(1)
})
