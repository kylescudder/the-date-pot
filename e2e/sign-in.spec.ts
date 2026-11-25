import { expect, test, type TestInfo } from '@playwright/test'

// Signed-out visitors start with no session, so these tests do not reuse the
// shared storage state: revoking a session here would break other journeys.
test.use({ storageState: { cookies: [], origins: [] } })

// Saves a PNG of the settled page and attaches it to this test's report entry.
async function capture(
  page: import('@playwright/test').Page,
  info: TestInfo,
  name: string
) {
  const path = info.outputPath(`${name}.png`)
  await page.screenshot({ path })
  await info.attach(name, { path, contentType: 'image/png' })
}

test('a signed-out member signs in with email and password and reaches their pots and profile', async ({
  page
}, info) => {
  const email = process.env.E2E_USERNAME
  const password = process.env.E2E_PASSWORD
  if (!email || !password) throw new Error('E2E credentials are not set.')

  await page.goto('/auth/sign-in')
  await expect(page.locator('#email')).toBeVisible()
  await capture(page, info, 'sign-in-page')

  await page.locator('#email').fill(email)
  await page.locator('#password').fill(password)
  await page.getByRole('button', { name: 'Sign In', exact: true }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/auth/'), {
    timeout: 30000
  })
  await expect(page.getByRole('link', { name: 'Beer' })).toBeVisible()
  await capture(page, info, 'signed-in-pots')

  await page.goto('/profile')
  await expect(
    page.getByRole('heading', { name: 'Your profile' })
  ).toBeVisible()
  await capture(page, info, 'profile')
})
