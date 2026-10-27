import { expect, test, type Page } from '@playwright/test'

const faith = '/beer/55555555-5555-4555-8555-555555555551'
const strangerBeer = '/beer/99999999-9999-4999-8999-999999999991'

async function addRecord(page: Page, list: string) {
  await page.goto(list)
  await page.locator('#add-button').click()
  return page.getByRole('dialog')
}

test('the sidebar lists every pot and the beer list shows only our group', async ({
  page
}) => {
  await page.goto('/beers')
  for (const pot of [
    'Activity',
    'Beer',
    'Coffee',
    'Film',
    'Restaurant',
    'Vinyl'
  ])
    await expect(page.getByRole('link', { name: pot })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Faith' })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Old Stout' })).toBeVisible()
  await expect(page.getByText("Someone Else's Beer")).toHaveCount(0)
})

test('another group’s beer cannot be opened', async ({ page }) => {
  await page.goto(strangerBeer)
  await expect(
    page.getByText('Something went wrong getting that beer!')
  ).toBeVisible()
})

test('a beer can be added, renamed and archived', async ({ page }) => {
  const dialog = await addRecord(page, '/beers')
  await dialog.locator('#name').fill('Playwright Pale')
  await dialog.locator('#abv').fill('4.5')
  await dialog.getByRole('button', { name: 'Add Beer' }).click()
  await page.waitForURL(/\/beer\/[0-9a-f-]{36}$/)
  await expect(page.locator('#name')).toHaveValue('Playwright Pale')
  await expect(page.locator('#abv')).toHaveValue('4.5')

  await page.locator('#name').fill('Playwright Pale Ale')
  await page.getByRole('button', { name: 'Update Beer' }).click()
  await expect(page.getByText('Playwright Pale Ale updated! 🥳')).toBeVisible()
  await page.reload()
  await expect(page.locator('#name')).toHaveValue('Playwright Pale Ale')

  await page.getByRole('button', { name: 'archive' }).click()
  await expect(page.getByText('Playwright Pale Ale archived 📦')).toBeVisible()
  await page.waitForURL(/\/beers$/)
  await expect(page.getByRole('cell', { name: 'Faith' })).toBeVisible()
  await expect(page.getByText('Playwright Pale Ale')).toHaveCount(0)
})

test('a beer’s ratings are shown and its overall rating is averaged', async ({
  page
}) => {
  await page.goto(faith)
  await expect(page.getByText('Test Kyle')).toBeVisible()
  await expect(page.getByText('Test Partner')).toBeVisible()
  await expect(page.getByText('Northern Monk', { exact: true })).toBeVisible()
})

test('a vinyl can be added and appears in the list', async ({ page }) => {
  const dialog = await addRecord(page, '/vinyls')
  await dialog.locator('#name').fill('Court and Spark')
  await dialog.locator('#artist').fill('Joni Mitchell')
  await dialog.getByRole('button', { name: /Add Vinyl/ }).click()
  await page.waitForURL(/\/vinyl\/[0-9a-f-]{36}$/)
  await page.goto('/vinyls')
  await expect(
    page.getByRole('cell', { name: 'Court and Spark' })
  ).toBeVisible()
})

test('an existing vinyl opens and can be marked as purchased', async ({
  page
}) => {
  await page.goto('/vinyl/55555555-5555-4555-8555-5555555555a1')
  await expect(page.locator('#artist')).toHaveValue('Joni Mitchell')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: /Update Vinyl/ }).click()
  await expect(page.getByText('Blue updated! 🥳')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('checkbox')).toBeChecked()
})

test('a film opens with its saved details and can be updated', async ({
  page
}) => {
  await page.goto('/films')
  await page.getByRole('cell', { name: 'Lady Bird' }).click()
  await page.waitForURL(/\/film\/55555555/)
  await expect(page.locator('#name')).toHaveValue('Lady Bird')
  await expect(page.locator('#runTime')).toHaveValue('94')
  await page.locator('#runTime').fill('95')
  await page.getByRole('button', { name: /Update Film/ }).click()
  await expect(page.getByText('Lady Bird updated! 🥳')).toBeVisible()
  await page.reload()
  await expect(page.locator('#runTime')).toHaveValue('95')
})

test('the restaurant, coffee and activity pages load their records', async ({
  page
}) => {
  await page.goto('/restaurants')
  await expect(page.getByRole('cell', { name: "Rudy's Pizza" })).toBeVisible()
  await page.goto('/coffees')
  await expect(page.getByRole('cell', { name: 'Grindsmith' })).toBeVisible()
  await page.goto('/activities')
  await expect(page.getByRole('cell', { name: 'Crazy golf' })).toBeVisible()
})
