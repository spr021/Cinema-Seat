import React, { Fragment, useState, useEffect } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { User } from "../../../types/user"

interface UserEditModalProps {
  isModalOpen: boolean
  setIsModalOpen: (isOpen: boolean) => void
  currentUser: User | null
  isEditing: boolean
  fetchUsers: () => Promise<void>
  setError: (error: string | null) => void
}

export function UserEditModal({
  isModalOpen,
  setIsModalOpen,
  currentUser,
  isEditing,
  fetchUsers,
  setError,
}: UserEditModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
    roles: [] as string[],
  })

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar || "",
        roles: currentUser.roles,
      })
    } else {
      // Reset form for "Add New User" case if needed, though current flow only uses for edit
      setFormData({
        name: "",
        email: "",
        avatar: "",
        roles: [],
      })
    }
  }, [currentUser, isEditing])

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]:
        name === "roles" ? value.split(",").map((role) => role.trim()) : value,
    })
  }

  const handleSubmit = async () => {
    try {
      if (!currentUser) {
        setError("No user selected for editing.")
        return
      }

      const token = localStorage.getItem("token") || sessionStorage.getItem("token")
      if (!token) {
        setError("No authentication token found.")
        return
      }

      const response = await fetch(`${API_URL}/auth/${currentUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update user")
      }

      await fetchUsers()
      setIsModalOpen(false)
    } catch (error) {
      console.error("Failed to submit user:", error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unknown error occurred during update.")
      }
    }
  }

  return (
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
                      {isEditing ? "Edit User" : "Add New User"}
                    </Dialog.Title>
                    <div className="mt-2">
                      <form className="space-y-4">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Name
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholder="User name"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Email
                          </label>
                          <div className="mt-2">
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholder="user@example.com"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="avatar"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Avatar URL
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="avatar"
                              id="avatar"
                              value={formData.avatar}
                              onChange={handleInputChange}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholder="https://example.com/avatar.jpg"
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="roles"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Roles (comma-separated)
                          </label>
                          <div className="mt-2">
                            <input
                              type="text"
                              name="roles"
                              id="roles"
                              value={formData.roles.join(", ")}
                              onChange={handleInputChange}
                              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                              placeholder="user, admin"
                            />
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
                    {isEditing ? "Save Changes" : "Add User"}
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
  )
}
