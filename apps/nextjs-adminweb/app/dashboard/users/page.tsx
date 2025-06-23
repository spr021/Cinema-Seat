"use client"

import React, { useState } from "react"
import { LoadingSpinner } from "../../components/LoadingSpinner"
import { useUsersData } from "../../hooks/useUsersData"
import { UserEditModal } from "./components/UserEditModal"
import { UserDeleteModal } from "./components/UserDeleteModal"
import { UserTable } from "./components/UserTable"
import { User } from "../../types/user"

function UsersPage() {
  const {
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    fetchUsers,
    filteredUsers,
    setError,
  } = useUsersData()

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL

  // Open modal for editing a user
  const openEditModal = (user: User) => {
    setCurrentUser(user)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  // Handle making a user an admin
  const handleMakeAdmin = async (user: User) => {
    if (
      window.confirm(`Are you sure you want to make ${user.name} an admin?`)
    ) {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token")
        if (!token) {
          setError("No authentication token found.")
          return
        }

        const response = await fetch(`${API_URL}/auth/users/${user._id}/role`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roles: ["user", "admin"] }), // Assuming roles can be both user and admin
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to update user role")
        }

        await fetchUsers() // Re-fetch users to update the list
      } catch (error) {
        console.error("Failed to make user admin:", error)
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError("An unknown error occurred during role update.")
        }
      }
    }
  }

  // Handle user deletion
  const handleDelete = async () => {
    if (
      currentUser &&
      window.confirm(
        `Are you sure you want to delete ${currentUser.name}? This action cannot be undone.`
      )
    ) {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token")
        if (!token) {
          setError("No authentication token found.")
          return
        }

        const response = await fetch(`${API_URL}/auth/${currentUser._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to delete user")
        }

        await fetchUsers() // Re-fetch users to update the list
        setIsDeleteModalOpen(false)
      } catch (error) {
        console.error("Failed to delete user:", error)
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError("An unknown error occurred during deletion.")
        }
      }
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>
  }

  return (
    <div>
      <UserTable
        filteredUsers={filteredUsers}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        openEditModal={openEditModal}
        handleMakeAdmin={handleMakeAdmin}
        setCurrentUser={setCurrentUser}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
      />

      <UserEditModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        currentUser={currentUser}
        isEditing={isEditing}
        fetchUsers={fetchUsers}
        setError={setError}
      />

      <UserDeleteModal
        isDeleteModalOpen={isDeleteModalOpen}
        setIsDeleteModalOpen={setIsDeleteModalOpen}
        currentUser={currentUser}
        handleDelete={handleDelete}
      />
    </div>
  )
}

export default UsersPage
