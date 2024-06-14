// global-setup.ts
import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('http://127.0.0.1:3000') // Adjust the URL to your app's login page

  // Wait for ClerkJS to load
  await page.waitForSelector('div[data-clerk]')

  // Enter user credentials
  await page.fill(
    'input[name="email"]',
    process.env.TEST_EMAIL || 'your-email@example.com'
  )
  await page.fill(
    'input[name="password"]',
    process.env.TEST_PASSWORD || 'your-password'
  )

  // Click the login button
  await page.click('button[type="submit"]')

  // Wait for navigation or a specific element that appears after login
  await page.waitForNavigation()

  // Save storage state
  await page.context().storageState({ path: 'auth.json' })
  await browser.close()
}

export default globalSetup
