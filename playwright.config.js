import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
  },
  webServer: {
    command: "npm run dev:test",
    env: {
      ADMIN_AUTH_DISABLED: "1",
      ADMIN_DEV_AUTH_BYPASS: "1",
      ADMIN_EMAILS: "admin@example.com",
      AUTH_GOOGLE_ID: "playwright-google-client-id",
      AUTH_GOOGLE_SECRET: "playwright-google-client-secret",
      AUTH_SECRET: "playwright-test-secret-playwright-test-secret",
      DATABASE_URL: "",
    },
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
