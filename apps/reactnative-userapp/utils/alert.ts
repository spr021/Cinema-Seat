import { Alert, Platform, AlertButton } from "react-native"

interface AlertButtonInput {
  text: string
  style?: "default" | "cancel" | "destructive"
  onPress?: () => void
}

/**
 * Alert.alert is a no-op on react-native-web, which silently killed flows
 * like "Reservation Successful -> OK -> pay". This wrapper keeps the native
 * Alert behavior and falls back to window.alert/confirm on web.
 */
export function showAlert(
  title: string,
  message?: string,
  buttons: AlertButtonInput[] = []
): void {
  if (Platform.OS !== "web") {
    Alert.alert(
      title,
      message,
      buttons as AlertButton[]
    )
    return
  }

  // Web: single button -> plain alert; multiple buttons -> confirm
  if (buttons.length <= 1) {
    window.alert(message ? `${title}\n\n${message}` : title)
    buttons[0]?.onPress?.()
    return
  }

  const confirmButton =
    buttons.find((b) => b.style !== "cancel") ?? buttons[buttons.length - 1]
  const cancelButton = buttons.find((b) => b.style === "cancel")

  const confirmed = window.confirm(message ? `${title}\n\n${message}` : title)
  if (confirmed) {
    confirmButton?.onPress?.()
  } else {
    cancelButton?.onPress?.()
  }
}
