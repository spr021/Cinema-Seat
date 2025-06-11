import { StyleSheet, View, Text, Alert } from "react-native"
import React from "react"
import { CustomTabs, Tab } from "@/components/CustomTabs"
import { Input, InputField } from "@/components/ui/input"
import { Button, ButtonText } from "@/components/ui/button"
import LoginPrompt from "@/app/auth/login-prompt"
import { useProfileLogic } from "@/hooks/useProfileLogic"

export default function TabTwoScreen() {
  const {
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
  } = useProfileLogic()

  if (!token) {
    return <LoginPrompt />
  }

  const tabs: Tab[] = [
    {
      title: "Change My Data",
      content: (
        <View style={styles.tabContentContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputRow}>
            <View style={styles.inputWrapperHalf}>
              <Text style={styles.inputLabel}>First name*</Text>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </Input>
            </View>
            <View style={styles.inputWrapperHalf}>
              <Text style={styles.inputLabel}>Last name*</Text>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </Input>
            </View>
          </View>

          <Button
            action="primary"
            variant="solid"
            style={styles.saveButton}
            onPress={handleUpdatePersonalData}
          >
            <ButtonText>SAVE DATA</ButtonText>
          </Button>
        </View>
      ),
    },
    {
      title: "Change Email",
      content: (
        <View style={styles.tabContentContainer}>
          <Text style={styles.sectionTitle}>Change Email</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>New Email*</Text>
            <Input variant="outline" size="md">
              <InputField
                placeholder="New Email"
                value={newEmail}
                onChangeText={setNewEmail}
              />
            </Input>
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Confirm New Email*</Text>
            <Input variant="outline" size="md">
              <InputField
                placeholder="Confirm New Email"
                value={confirmNewEmail}
                onChangeText={setConfirmNewEmail}
              />
            </Input>
          </View>
          <Button
            action="primary"
            variant="solid"
            style={styles.saveButton}
            onPress={handleUpdateEmail}
          >
            <ButtonText>SAVE EMAIL</ButtonText>
          </Button>
        </View>
      ),
    },
    {
      title: "Change Password",
      content: (
        <View style={styles.tabContentContainer}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Current Password*</Text>
            <Input variant="outline" size="md">
              <InputField
                placeholder="Current Password"
                secureTextEntry={true}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
            </Input>
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>New Password*</Text>
            <Input variant="outline" size="md">
              <InputField
                placeholder="New Password"
                secureTextEntry={true}
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </Input>
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Confirm New Password*</Text>
            <Input variant="outline" size="md">
              <InputField
                placeholder="Confirm New Password"
                secureTextEntry={true}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />
            </Input>
          </View>
          <Button
            action="primary"
            variant="solid"
            style={styles.saveButton}
            onPress={handleUpdatePassword}
          >
            <ButtonText>SAVE PASSWORD</ButtonText>
          </Button>
        </View>
      ),
    },
    {
      title: "Delete Account",
      content: (
        <View style={styles.tabContentContainer}>
          <Text style={styles.sectionTitle}>Delete Account</Text>
          <Text>
            Are you sure you want to delete your account? This action cannot be
            undone.
          </Text>
          <Button
            action="primary"
            variant="solid"
            style={styles.saveButton}
            onPress={handleDeleteAccount}
          >
            <ButtonText>DELETE ACCOUNT</ButtonText>
          </Button>
        </View>
      ),
    },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.fixedTabsContainer}>
        <CustomTabs tabs={tabs} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedTabsContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: "white", // Or the background color of your header
  },
  tabContentContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  inputWrapper: {
    marginBottom: 10,
  },
  inputWrapperHalf: {
    flex: 1,
    marginBottom: 10,
    marginRight: 10, // Add margin for spacing between half-width inputs
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  saveButton: {
    marginTop: 30,
    width: "100%",
  },
})
