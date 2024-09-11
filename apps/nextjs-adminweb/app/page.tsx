"use client";

import { Button, UiKitProvider } from "@this/uikit";

import styles from "../styles/index.module.css";

export default function Web() {
  return (
    <UiKitProvider>
    <div className={styles.container}>
      <h1>Web</h1>
      <Button

        onPress={() => {
          console.log("Pressed!")
          alert("Pressed!")
        }}
      >
        Boop
      </Button>
    </div>
    </UiKitProvider>
  );
}
