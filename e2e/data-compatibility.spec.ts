/**
 * Data compatibility E2E tests.
 *
 * Seeds localStorage with a legacy (v0) AppData payload before the app loads,
 * then asserts the app migrates and renders correctly — simulating a real user
 * opening the app after a code update.
 */

import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns today's date as YYYY-MM-DD in local time (runs in Node context). */
function todayLocalDate(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/**
 * A v0 AppData payload:
 * - no `version` key
 * - no `notes` key
 * - checkIns have no `status` field
 */
function buildV0Fixture(today: string) {
  return {
    habits: [
      {
        id: 'fixture-habit-1',
        name: 'Morning Run',
        icon: '🏃',
        color: 'indigo',
        createdAt: '2026-01-01',
      },
    ],
    checkIns: [
      {
        habitId: 'fixture-habit-1',
        date: today,
        completedAt: `${today}T08:00:00.000Z`,
        // deliberately omitting status — this is v0 format
      },
    ],
    // deliberately omitting notes and version — this is v0 format
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('legacy data migration (v0 → current)', () => {
  const today = todayLocalDate()
  const v0Fixture = buildV0Fixture(today)
  const v0Json = JSON.stringify(v0Fixture)

  test.beforeEach(async ({ page }) => {
    // Capture any uncaught page errors
    const pageErrors: Error[] = []
    page.on('pageerror', (err) => pageErrors.push(err))

    // Seed localStorage before the app boots
    await page.addInitScript((payload) => {
      localStorage.setItem('streak-keep:data', payload)
    }, v0Json)

    await page.goto('/streak-keep/')

    // Attach errors array to the test for later assertions
    ;(page as unknown as { _pageErrors: Error[] })._pageErrors = pageErrors
  })

  test('app loads without uncaught JS errors', async ({ page }) => {
    // Give the page a moment to fully initialise
    await expect(page.getByText('Morning Run')).toBeVisible()

    const errors = (page as unknown as { _pageErrors: Error[] })._pageErrors
    expect(errors).toHaveLength(0)
  })

  test('seeded habit name is visible', async ({ page }) => {
    await expect(page.getByText('Morning Run')).toBeVisible()
  })

  test('streak count is correct for seeded check-in', async ({ page }) => {
    // Fixture has one completed check-in for today → streak = 1
    await expect(page.getByText('1 day streak 🔥')).toBeVisible()
  })

  test('localStorage is updated to current schema version after migration', async ({ page }) => {
    // Wait for the app to render (migration runs on load)
    await expect(page.getByText('Morning Run')).toBeVisible()

    // Poll until the migration has written version back to localStorage.
    // The migration runs synchronously in loadData(), but the React useEffect
    // may also write a subsequent save — we wait for either to settle.
    await page.waitForFunction(() => {
      try {
        const raw = localStorage.getItem('streak-keep:data')
        if (!raw) return false
        const d = JSON.parse(raw)
        return typeof d.version === 'number' && d.version >= 1
      } catch {
        return false
      }
    })

    const stored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('streak-keep:data') ?? 'null'),
    )
    expect(stored).not.toBeNull()
    expect(stored.version).toBeGreaterThanOrEqual(1)
    // All check-ins should have an explicit status after migration
    for (const checkIn of stored.checkIns) {
      expect(checkIn.status).toBeDefined()
    }
  })
})
