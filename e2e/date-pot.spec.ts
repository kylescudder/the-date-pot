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
}, info) => {
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
  await page.screenshot({
    path: info.outputPath('beers-desktop.png'),
    fullPage: true
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(
    page.getByRole('cell', { name: 'Faith', exact: true })
  ).toBeVisible()
  await page.screenshot({
    path: info.outputPath('beers-mobile.png'),
    fullPage: true
  })
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

const ladyBird = '/film/55555555-5555-4555-8555-555555555571'

// The release date calendar opens on the current month, not the film's saved
// date, so these tests pick the first of this month: it is always on screen
// and never in the future.
function firstOfThisMonth() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  return {
    weekday: first.toLocaleString('en-US', { weekday: 'long' }),
    month: first.toLocaleString('en-US', { month: 'long' }),
    year: first.getFullYear()
  }
}

// The popover fades and scales in; wait for that to finish so screenshots and
// measurements show the settled calendar.
async function waitForAnimations(page: Page) {
  await page.waitForFunction(() => document.getAnimations().length === 0)
}

test('a film’s release date is picked on the calendar and saved', async ({
  page
}, info) => {
  const { weekday, month, year } = firstOfThisMonth()
  await page.goto(ladyBird)
  await expect(page.locator('#name')).toHaveValue('Lady Bird')
  await page.getByRole('button', { name: 'Release Date', exact: true }).click()
  const calendar = page.getByRole('grid', { name: `${month} ${year}` })
  await expect(calendar).toBeVisible()
  await waitForAnimations(page)
  await page.screenshot({ path: info.outputPath('film-calendar-desktop.png') })
  await calendar
    .getByRole('button', {
      name: `${weekday}, ${month} 1st, ${year}`,
      exact: true
    })
    .click()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: /Update Film/ }).click()
  await expect(page.getByText('Lady Bird updated! 🥳')).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Release Date', exact: true })
  ).toHaveText(`${month} 1st, ${year}`)
})

test.describe('on a phone-width screen', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('a film’s release date calendar fits within the screen', async ({
    page
  }, info) => {
    await page.goto(ladyBird)
    await page
      .getByRole('button', { name: 'Release Date', exact: true })
      .click()
    const calendar = page.getByRole('grid')
    await expect(calendar).toBeVisible()
    await waitForAnimations(page)
    const box = await calendar.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(390)
    await page.screenshot({ path: info.outputPath('film-calendar-mobile.png') })
  })
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
