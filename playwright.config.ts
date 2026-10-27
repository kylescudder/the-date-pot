import { defineConfig } from '@playwright/test'

// Runs against a local server whose database was seeded from
// tests/fixtures/seed.sql, signed in as the Clerk DEV test user.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  outputDir: 'state/e2e/test-results',
  reporter: [
    ['list'],
    ['html', { outputFolder: 'state/e2e/playwright-report', open: 'never' }]
  ],
  globalSetup: './e2e/setup.ts',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3472',
    storageState: 'state/e2e/auth.json',
    viewport: { width: 1280, height: 800 },
    colorScheme: 'dark',
    screenshot: 'only-on-failure',
    // Authenticated network traces can contain session credentials.
    trace: 'off'
  }
})
