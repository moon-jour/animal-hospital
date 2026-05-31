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
      ADMIN_DEV_MAGIC_LINKS: "1",
      ADMIN_EMAILS: "admin@example.com",
      AUTH_SECRET: "playwright-test-secret-playwright-test-secret",
    },
    url: "http://127.0.0.1:4173/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
