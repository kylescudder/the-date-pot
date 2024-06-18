import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Runs before each test and signs in each page.
  await setupClerkTestingToken({ page })
  await page.goto('/')

  await expect(page.locator('h1')).toContainText('Sign in to The Date Pot')
  await page.waitForSelector('.cl-signIn-root', { state: 'attached' })
  await page
    .locator('input[name=identifier]')
    .fill(process.env.E2E_CLERK_USER_USERNAME!)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page
    .locator('input[name=password]')
    .fill(process.env.E2E_CLERK_USER_PASSWORD!)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.waitForURL('**/')

  await page.getByRole('link', { name: 'Activity' }).click()
})

test('add activity', async ({ page }) => {
  await page.locator('#add-button').click()

  await page.getByPlaceholder('The good yum yum place').fill('Test')
  await page.getByPlaceholder('Where it at?').fill('TN377DR')

  await page.getByRole('button', { name: 'Add Activity' }).click()
})

test('search for activity', async ({ page }) => {
  await page.locator('#search-button')
  await page.getByPlaceholder('Search...').fill('Test')
  await page.getByRole('gridcell', { name: 'Test' }).click()

  await expect(
    await page.getByPlaceholder('The good yum yum place')
  ).toBeVisible()

  await expect(
    (await page.getByPlaceholder('The good yum yum place').inputValue()) ===
      'Test'
  )
})

test('update activity', async ({ page }) => {
  await page.locator('#search-button').click()
  await page.getByPlaceholder('Search...').fill('Test')
  await page.getByRole('gridcell', { name: 'Test' }).click()
  await page.getByRole('button', { name: 'Update Activity' }).click()

  await expect(
    await page.locator('div').filter({ hasText: 'Test updated! 🥳' }).nth(3)
  ).toBeVisible()
})

test('archive activity', async ({ page }) => {
  await page.locator('#search-button').click()
  await page.getByPlaceholder('Search...').fill('Test')
  await page.getByRole('gridcell', { name: 'Test' }).click()

  await page.getByLabel('archive').click()

  await expect(
    await page.getByRole('columnheader', { name: 'Name' })
  ).toBeVisible()
})
