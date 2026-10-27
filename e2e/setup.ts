import { chromium, type FullConfig } from '@playwright/test'
import { chmod, mkdir } from 'node:fs/promises'

export default async function setup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL!
  if (!['localhost', '127.0.0.1'].includes(new URL(baseURL).hostname))
    throw new Error('E2E verification requires a local disposable environment.')
  const username = process.env.E2E_USERNAME
  const password = process.env.E2E_PASSWORD
  if (!username || !password)
    throw new Error(
      'Set E2E_USERNAME and E2E_PASSWORD to an existing Clerk DEV test login.'
    )
  await mkdir('state/e2e', { recursive: true })
  // Login has no tracing or screenshots: credentials never enter test artifacts.
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.goto(baseURL + '/sign-in')
    await page.locator('#identifier-field').fill(username)
    await page.locator('#password-field').fill(password)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.waitForURL((url) => !url.pathname.includes('sign-in'), {
      timeout: 30000
    })
    await page.getByRole('link', { name: 'Beer' }).waitFor()
    await page.context().storageState({ path: 'state/e2e/auth.json' })
    await chmod('state/e2e/auth.json', 0o600)
  } finally {
    await browser.close()
  }
}
