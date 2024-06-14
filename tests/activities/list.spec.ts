import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test } from '@playwright/test'

test('list has items', async ({ page }) => {
  await page.goto('./')
  await page.getByText('Name').click()
  await page.getByRole('gridcell', { name: 'course cuisine night' }).click()
  // Expect a title "to contain" a substring.
  const gridcell = page.getByRole('gridcell', { name: 'course cuisine night' })
  //await expect(gridcell).toHaveText('course cuisine night')
})

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/')

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click()

  // Expects page to have a heading with the name of Installation.
  //await expect(
  //  page.getByRole('heading', { name: 'Installation' })
  //).toBeVisible()
})
