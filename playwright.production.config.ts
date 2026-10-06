import { defineConfig, devices } from '@playwright/test'

const productionBaseUrl = process.env.BASE_URL ?? 'https://supertool.id'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  use: {
    baseURL: productionBaseUrl,
    // Without these a stalled navigation waits for the whole serial test timeout.
    navigationTimeout: 30_000,
    actionTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
})
