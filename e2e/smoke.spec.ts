import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/streak-keep/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('Today page loads', async ({ page }) => {
  await expect(page.getByText('No habits yet')).toBeVisible()
})

test('create a habit, check it in, verify streak shows 1', async ({ page }) => {
  // Navigate to new habit form
  await page.getByRole('button', { name: 'Add a habit' }).click()
  await expect(page).toHaveURL(/\/habits\/new/)

  // Fill in habit name
  await page.getByPlaceholder('e.g. Study session').fill('Morning Run')

  // Submit the form
  await page.getByRole('button', { name: 'Create Habit' }).click()
  await expect(page).toHaveURL(/\/habits$/)

  // Go to Today page
  await page.goto('/streak-keep/')

  // Check in the habit
  await page.getByRole('button', { name: 'Mark as done' }).click()

  // Verify streak shows 1
  await expect(page.getByText('1 day streak 🔥')).toBeVisible()
})

test('check in a habit, reload page, verify streak persists', async ({ page }) => {
  // Create a habit
  await page.getByRole('button', { name: 'Add a habit' }).click()
  await page.getByPlaceholder('e.g. Study session').fill('Evening Walk')
  await page.getByRole('button', { name: 'Create Habit' }).click()
  await page.goto('/streak-keep/')

  // Check in
  await page.getByRole('button', { name: 'Mark as done' }).click()
  await expect(page.getByText('1 day streak 🔥')).toBeVisible()

  // Reload and verify streak persists
  await page.reload()
  await expect(page.getByText('1 day streak 🔥')).toBeVisible()
})
