import { StyleSheet, View, Text, TouchableOpacity } from "react-native"
import React from "react"
import ParallaxScrollView from "@/components/ParallaxScrollView"
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
import { useProfileData } from "@/hooks/useProfileData"

export default function TabTwoScreen() {
  const {
    salutation,
    setSalutation,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    birthDate,
    setBirthDate,
    street,
    setStreet,
    houseNumber,
    setHouseNumber,
    land,
    setLand,
    plz,
    setPlz,
    city,
    setCity,
    uciCinema,
    setUciCinema,
  } = useProfileData()

  const tabs = [
    {
      title: "Change My Data",
      content: (
        <View style={styles.tabContentContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Salutation*</Text>
              <Select selectedValue={salutation} onValueChange={setSalutation}>
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder="Select Salutation" />
                  <SelectIcon as={ChevronDownIcon} />
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

          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Birth date*</Text>
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

          <Text style={styles.sectionTitle}>Your contact details</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputWrapperFlex}>
              <Text style={styles.inputLabel}>Street</Text>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="Street"
                  value={street}
                  onChangeText={setStreet}
                />
              </Input>
            </View>
            <View style={styles.inputWrapperSmall}>
              <Text style={styles.inputLabel}>House n...</Text>
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
              <Text style={styles.inputLabel}>Land</Text>
              <Select selectedValue={land} onValueChange={setLand}>
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder="Select Land" />
                  <SelectIcon as={ChevronDownIcon} />
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
              <Text style={styles.inputLabel}>PLZ</Text>
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
              <Text style={styles.inputLabel}>City</Text>
              <Input variant="outline" size="md">
                <InputField
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />
              </Input>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Your favorite UCI cinema</Text>
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Your UCI*</Text>
              <Select selectedValue={uciCinema} onValueChange={setUciCinema}>
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder="Please select" />
                  <SelectIcon as={ChevronDownIcon} />
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
        </View>
      ),
    },
    {
      title: "Change Email",
      content: (
        <View>
          <Text>Content for Change Email tab.</Text>
        </View>
      ),
    },
    {
      title: "Change Password",
      content: (
        <View>
          <Text>Content for Change Password tab.</Text>
        </View>
      ),
    },
    {
      title: "Delete Account",
      content: (
        <View>
          <Text>Content for Delete Account tab.</Text>
        </View>
      ),
    },
  ]

  return (
    <View style={styles.container}>
      <View style={styles.fixedTabsContainer}>
        <CustomTabs tabs={tabs} />
      </View>
      <View style={styles.parallaxScrollView}>
        <ParallaxScrollView
          headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
        >
          {/* The content of the tabs is already within the CustomTabs component */}
        </ParallaxScrollView>
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
  parallaxScrollView: {
    flex: 1,
    marginTop: 50, // Adjust this value based on the height of your CustomTabs
  },
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
