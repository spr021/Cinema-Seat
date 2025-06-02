import { StyleSheet, View, TouchableOpacity } from "react-native"
import React, { useState } from "react"

import ParallaxScrollView from "@/components/ParallaxScrollView"
import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { CustomTabs } from "@/components/CustomTabs"
import { Input, InputField } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Icon, CalendarDaysIcon, ChevronDownIcon } from "@/components/ui/icon"
import { Button, ButtonText } from "@/components/ui/button"

export default function TabTwoScreen() {
  const [salutation, setSalutation] = useState("Mister")
  const [firstName, setFirstName] = useState("Maryam")
  const [lastName, setLastName] = useState("Mirzaiebiroundeh")
  const [birthDate, setBirthDate] = useState("01.04.1999")
  const [street, setStreet] = useState("")
  const [houseNumber, setHouseNumber] = useState("")
  const [land, setLand] = useState("Germany")
  const [plz, setPlz] = useState("")
  const [city, setCity] = useState("")
  const [uciCinema, setUciCinema] = useState("")

  const tabs = [
    {
      title: "Change My Data",
      content: (
        <ThemedView style={styles.tabContentContainer}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Personal Information
          </ThemedText>
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <ThemedText style={styles.inputLabel}>Salutation*</ThemedText>
              <Select
                selectedValue={salutation}
                onValueChange={(value) => setSalutation(value)}
              >
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder="Select Salutation" />
                  <SelectIcon
                  // mr="$3"
                  >
                    {/* <Icon as={ChevronDownIcon} /> */}
                  </SelectIcon>
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectItem label="Mister" value="Mister" />
                    <SelectItem label="Miss" value="Miss" />
                    <SelectItem label="Diverse" value="Diverse" />
                  </SelectContent>
                </SelectPortal>
              </Select>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputWrapperHalf}>
              <ThemedText style={styles.inputLabel}>First name*</ThemedText>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="First name"
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </Input>
            </View>
            <View style={styles.inputWrapperHalf}>
              <ThemedText style={styles.inputLabel}>Last name*</ThemedText>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="Last name"
                  value={lastName}
                  onChangeText={setLastName}
                />
              </Input>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <ThemedText style={styles.inputLabel}>Birth date*</ThemedText>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="DD.MM.YYYY"
                  value={birthDate}
                  onChangeText={setBirthDate}
                  keyboardType="numeric"
                />
                <Icon as={CalendarDaysIcon} />
              </Input>
            </View>
          </View>

          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Your contact details
          </ThemedText>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapperFlex}>
              <ThemedText style={styles.inputLabel}>Street</ThemedText>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="Street"
                  value={street}
                  onChangeText={setStreet}
                />
              </Input>
            </View>
            <View style={styles.inputWrapperSmall}>
              <ThemedText style={styles.inputLabel}>House n...</ThemedText>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="No."
                  value={houseNumber}
                  onChangeText={setHouseNumber}
                />
              </Input>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputWrapperHalf}>
              <ThemedText style={styles.inputLabel}>Land</ThemedText>
              <Select
                selectedValue={land}
                onValueChange={(value) => setLand(value)}
              >
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder="Select Land" />
                  <SelectIcon
                  //  mr="$3"
                  >
                    {/* <Icon as={ChevronDownIcon} /> */}
                  </SelectIcon>
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectItem label="Germany" value="Germany" />
                    <SelectItem label="France" value="France" />
                    <SelectItem label="Spain" value="Spain" />
                  </SelectContent>
                </SelectPortal>
              </Select>
            </View>
            <View style={styles.inputWrapperHalf}>
              <ThemedText style={styles.inputLabel}>PLZ</ThemedText>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="PLZ"
                  value={plz}
                  onChangeText={setPlz}
                  keyboardType="numeric"
                />
              </Input>
            </View>
            <View style={styles.inputWrapperHalf}>
              <ThemedText style={styles.inputLabel}>City</ThemedText>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />
              </Input>
            </View>
          </View>

          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Your favorite UCI cinema
          </ThemedText>
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <ThemedText style={styles.inputLabel}>Your UCI*</ThemedText>
              <Select
                selectedValue={uciCinema}
                onValueChange={(value) => setUciCinema(value)}
              >
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder="Please select" />
                  <SelectIcon
                  // mr="$3"
                  >
                    {/* <Icon as={ChevronDownIcon} /> */}
                  </SelectIcon>
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectItem label="UCI Cinema 1" value="uci1" />
                    <SelectItem label="UCI Cinema 2" value="uci2" />
                    <SelectItem label="UCI Cinema 3" value="uci3" />
                  </SelectContent>
                </SelectPortal>
              </Select>
            </View>
          </View>

          <Button action="primary" variant="solid" style={styles.saveButton}>
            <ButtonText>SAVE DATA</ButtonText>
          </Button>
        </ThemedView>
      ),
    },
    {
      title: "Change Email",
      content: (
        <ThemedView>
          <ThemedText type="default">Content for Change Email tab.</ThemedText>
        </ThemedView>
      ),
    },
    {
      title: "Change Password",
      content: (
        <ThemedView>
          <ThemedText type="default">
            Content for Change Password tab.
          </ThemedText>
        </ThemedView>
      ),
    },
    {
      title: "Delete Account",
      content: (
        <ThemedView>
          <ThemedText type="default">
            Content for Delete Account tab.
          </ThemedText>
        </ThemedView>
      ),
    },
  ]

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile</ThemedText>
      </ThemedView>
      <CustomTabs tabs={tabs} />
    </ParallaxScrollView>
  )
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
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
  inputGroup: {
    marginBottom: 15,
  },
  inputWrapper: {
    marginBottom: 10,
  },
  inputWrapperHalf: {
    flex: 1,
    marginBottom: 10,
    marginRight: 10, // Add margin for spacing between half-width inputs
  },
  inputWrapperFlex: {
    flex: 2, // Adjust flex to make street wider
    marginBottom: 10,
    marginRight: 10,
  },
  inputWrapperSmall: {
    flex: 0.8, // Adjust flex for house number
    marginBottom: 10,
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
    backgroundColor: "#FFD700", // Yellow color from the image
  },
})
