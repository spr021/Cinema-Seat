import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    // The in-memory MongoDB needs time to download/start on the first run
    testTimeout: 30000,
    hookTimeout: 60000,
    // Keep the default pool for isolation; run test files sequentially so
    // they share one in-memory database gracefully
    fileParallelism: false,
    exclude: ["**/node_modules/**", "**/dist/**"],
  },
})
