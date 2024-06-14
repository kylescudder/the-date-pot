import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('./sign-in')
  await page.getByLabel('Email address').fill('kyle@kylescudder.co.uk')
  await page.getByRole('button', { name: 'Continue' }).click()
  await page
    .getByLabel('Password', { exact: true })
    .fill('qjoWvM$4zZLnY4xZ^1m@')
  await page.getByRole('button', { name: 'Continue' }).click()
  // Wait until the page receives the cookies.

  // Alternatively, you can wait until the page reaches a state where all cookies are set.
  await expect(page.getByRole('link', { name: 'The Date Pot' })).toBeVisible()

  // End of authentication steps.

  await page.context().storageState({ path: authFile })
})
