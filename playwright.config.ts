import { defineConfig, devices } from '@playwright/test'
require('dotenv').config()

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    storageState: 'auth.json' // Use the saved auth state for all tests
  },
  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox']
      }
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari']
      }
    }
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI
  },
  globalSetup: require.resolve('./global.setup.ts') // Add this line to specify the global setup script
})
