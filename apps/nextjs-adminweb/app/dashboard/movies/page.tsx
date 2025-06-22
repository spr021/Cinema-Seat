"use client"

import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import { useState, Fragment, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"

// Movie interface based on the model
interface Movie {
  _id: string
  title: string
  img: string
  genre: string
  duration: number
  year: string
  rating?: number
  summary?: string
  shows: string[]
  createdAt?: string
  updatedAt?: string
}

// Genre options for the form
const genreOptions = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western",
]

export default function Movies() {
  // State for movies list and search
  const [movies, setMovies] = useState<Movie[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    img: "",
    genre: "",
    duration: 0,
    year: "",
    rating: 0,
    summary: "",
  })

  // API URL
  const API_URL = "http://localhost:4000" // Assuming your backend is running on localhost:3000

  // Fetch movies on component mount
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(`${API_URL}/movie`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setMovies(data)
        setFilteredMovies(data)
      } catch (error) {
        console.error("Failed to fetch movies:", error)
      }
    }

    fetchMovies()
  }, [])

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setFilteredMovies(movies)
      return
    }

    const lowercasedTerm = term.toLowerCase()
    const filtered = movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(lowercasedTerm) ||
        movie.genre.toLowerCase().includes(lowercasedTerm) ||
        movie.year.includes(term)
    )
    setFilteredMovies(filtered)
  }

  // Open modal for adding a new movie
  const openAddModal = () => {
    setFormData({
      title: "",
      img: "",
      genre: "",
      duration: 0,
      year: "",
      rating: 0,
      summary: "",
    })
    setIsEditing(false)
    setIsModalOpen(true)
  }

  // Open modal for editing a movie
  const openEditModal = (movie: Movie) => {
    setFormData({
      title: movie.title,
      img: movie.img,
      genre: movie.genre,
      duration: movie.duration,
      year: movie.year,
      rating: movie.rating || 0,
      summary: movie.summary || "",
    })
    setCurrentMovie(movie)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  // Open delete confirmation modal
  const openDeleteModal = (movie: Movie) => {
    setCurrentMovie(movie)
    setIsDeleteModalOpen(true)
  }

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]:
        name === "duration" || name === "rating" ? parseInt(value) || 0 : value,
    })
  }

  // Handle form submission (Create/Update)
  const handleSubmit = async () => {
    try {
      if (isEditing && currentMovie) {
        // Update existing movie
        console.log("Updating movie:", currentMovie._id)

        const response = await fetch(`${API_URL}/movie/${currentMovie._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const updatedMovie = await response.json()

        const updatedMovies = movies.map((movie) =>
          movie._id === currentMovie._id ? updatedMovie : movie
        )
        setMovies(updatedMovies)
        setFilteredMovies(
          searchTerm
            ? updatedMovies.filter(
                (movie) =>
                  movie.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  movie.genre
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  movie.year.includes(searchTerm)
              )
            : updatedMovies
        )
      } else {
        // Add new movie
        const response = await fetch(`${API_URL}/movie`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const newMovie = await response.json()
        const updatedMovies = [...movies, newMovie]
        setMovies(updatedMovies)
        setFilteredMovies(
          searchTerm
            ? updatedMovies.filter(
                (movie) =>
                  movie.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  movie.genre
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  movie.year.includes(searchTerm)
              )
            : updatedMovies
        )
      }
      setIsModalOpen(false)
    } catch (error) {
      console.error("Failed to submit movie:", error)
    }
  }

  // Handle movie deletion
  const handleDelete = async () => {
    if (currentMovie) {
      try {
        const response = await fetch(`${API_URL}/movie/${currentMovie._id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const updatedMovies = movies.filter(
          (movie) => movie._id !== currentMovie._id
        )
        setMovies(updatedMovies)
        setFilteredMovies(
          searchTerm
            ? updatedMovies.filter(
                (movie) =>
                  movie.title
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  movie.genre
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  movie.year.includes(searchTerm)
              )
            : updatedMovies
        )
        setIsDeleteModalOpen(false)
      } catch (error) {
        console.error("Failed to delete movie:", error)
      }
    }
  }

  // Format duration to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Movies
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all movies in your system including their title, genre,
            duration and year.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add movie
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mt-4 max-w-md">
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="Search movies..."
          />
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Movie
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Genre
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Duration
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Year
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredMovies.map((movie) => (
                    <tr key={movie._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={movie.img}
                              alt={movie.title}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">
                              {movie.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {movie.genre}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDuration(movie.duration)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {movie.year}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => openEditModal(movie)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <PencilIcon className="h-5 w-5" />
                          <span className="sr-only">Edit</span>
                        </button>
                        <button
                          onClick={() => openDeleteModal(movie)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" />
                          <span className="sr-only">Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Movie Modal */}
      <Transition show={isModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        {isEditing ? "Edit Movie" : "Add New Movie"}
                      </Dialog.Title>
                      <div className="mt-2">
                        <form className="space-y-4">
                          <div>
                            <label
                              htmlFor="title"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Title
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="title"
                                id="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Movie title"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="img"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Image URL
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="img"
                                id="img"
                                value={formData.img}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="https://example.com/image.jpg"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="genre"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Genre
                            </label>
                            <div className="mt-2">
                              <select
                                id="genre"
                                name="genre"
                                value={formData.genre}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                required
                              >
                                <option value="">Select a genre</option>
                                {genreOptions.map((genre) => (
                                  <option key={genre} value={genre}>
                                    {genre}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="duration"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Duration (minutes)
                            </label>
                            <div className="mt-2">
                              <input
                                type="number"
                                name="duration"
                                id="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                min="1"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="year"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Year
                            </label>
                            <div className="mt-2">
                              <input
                                type="text"
                                name="year"
                                id="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="2023"
                                pattern="[0-9]{4}"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="rating"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Rating (0-10)
                            </label>
                            <div className="mt-2">
                              <input
                                type="number"
                                name="rating"
                                id="rating"
                                value={formData.rating}
                                onChange={handleInputChange}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                min="0"
                                max="10"
                              />
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor="summary"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Summary
                            </label>
                            <div className="mt-2">
                              <textarea
                                name="summary"
                                id="summary"
                                value={formData.summary}
                                onChange={handleInputChange}
                                rows={3}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Brief summary of the movie"
                              ></textarea>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                      onClick={handleSubmit}
                    >
                      {isEditing ? "Save Changes" : "Add Movie"}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Modal */}
      <Transition show={isDeleteModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <TrashIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        Delete Movie
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {`Are you sure you want to delete ${currentMovie?.title}? This action cannot be undone.`}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setIsDeleteModalOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
