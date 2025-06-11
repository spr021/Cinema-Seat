import { useState } from "react"

export const useProfileSettings = () => {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [confirmNewEmail, setConfirmNewEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    newEmail,
    setNewEmail,
    confirmNewEmail,
    setConfirmNewEmail,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
  }
}
