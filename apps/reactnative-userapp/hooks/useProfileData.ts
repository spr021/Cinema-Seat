import { useState } from "react"

interface UseProfileDataResult {
  salutation: string
  setSalutation: (salutation: string) => void
  firstName: string
  setFirstName: (firstName: string) => void
  lastName: string
  setLastName: (lastName: string) => void
  birthDate: string
  setBirthDate: (birthDate: string) => void
  street: string
  setStreet: (street: string) => void
  houseNumber: string
  setHouseNumber: (houseNumber: string) => void
  land: string
  setLand: (land: string) => void
  plz: string
  setPlz: (plz: string) => void
  city: string
  setCity: (city: string) => void
  uciCinema: string
  setUciCinema: (uciCinema: string) => void
}

export function useProfileData(): UseProfileDataResult {
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

  return {
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
  }
}
