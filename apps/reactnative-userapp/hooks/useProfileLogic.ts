import { Alert } from "react-native"
import { useAuth } from "@/context/AuthContext"
import { useProfileSettings } from "@/hooks/useProfileSettings"
import {
  updateUserData,
  deleteUserAccount,
  verifyCurrentPassword,
} from "@/services/userService"

export function useProfileLogic() {
  const { token, user, logout } = useAuth()
  const {
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
  } = useProfileSettings()

  const handleUpdatePersonalData = async () => {
    if (!token) return
    await updateUserData(token, { name: `${firstName} ${lastName}` })
    console.log("SAVE DATA successful")
    setFirstName("")
    setLastName("")
    Alert.alert("Success", "Personal information updated successfully!")
  }

  const handleUpdateEmail = async () => {
    if (!token) return
    if (newEmail !== confirmNewEmail) {
      Alert.alert("Error", "New email and confirm email do not match.")
      return
    }
    await updateUserData(token, { email: newEmail })
    console.log("SAVE EMAIL successful")
    setNewEmail("")
    setConfirmNewEmail("")
    Alert.alert("Success", "Email updated successfully!")
  }

  const handleUpdatePassword = async () => {
    if (!token) return
    try {
      await verifyCurrentPassword(token, currentPassword)
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to verify current password."
      )
      return
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New password and confirm password do not match.")
      return
    }
    await updateUserData(token, { password: newPassword })
    console.log("SAVE PASSWORD successful")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmNewPassword("")
    Alert.alert("Success", "Password updated successfully!")
    logout()
  }

  const handleDeleteAccount = () => {
    if (!token || !user?._id) return
    Alert.alert(
      "Confirm Account Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            await deleteUserAccount(token, user._id)
            console.log("DELETE ACCOUNT successful")
            logout()
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    )
  }

  return {
    token,
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
    handleUpdatePersonalData,
    handleUpdateEmail,
    handleUpdatePassword,
    handleDeleteAccount,
  }
}
