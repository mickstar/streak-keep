import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCurrentStreak, getMaxStreak, getTotalCompletions, getMissedDays } from '../streaks'
import * as storage from '../storage'
import type { CheckIn } from '../types'

const TODAY = '2026-03-10'

vi.mock('../storage', async () => {
  const actual = await vi.importActual<typeof import('../storage')>('../storage')
  return {
    ...actual,
    toLocalDate: vi.fn(actual.toLocalDate),
  }
})

function mkCheckIn(
  habitId: string,
  date: string,
  status: 'completed' | 'failed' = 'completed',
): CheckIn {
  return { habitId, date, completedAt: date + 'T12:00:00Z', status }
}

beforeEach(() => {
  vi.mocked(storage.toLocalDate).mockImplementation((date?: Date) => {
    if (!date) return TODAY
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  })
})

describe('getCurrentStreak', () => {
  it('returns 3 for a 3-day streak ending today', () => {
    const checkIns = [
      mkCheckIn('h1', '2026-03-10'),
      mkCheckIn('h1', '2026-03-09'),
      mkCheckIn('h1', '2026-03-08'),
    ]
    expect(getCurrentStreak(checkIns, 'h1')).toBe(3)
  })

  it('returns 2 when checked in yesterday but not today', () => {
    const checkIns = [mkCheckIn('h1', '2026-03-09'), mkCheckIn('h1', '2026-03-08')]
    expect(getCurrentStreak(checkIns, 'h1')).toBe(2)
  })

  it('returns 1 when a gap breaks the streak', () => {
    // today and 3 days ago checked in, but yesterday and 2 days ago are not
    const checkIns = [mkCheckIn('h1', '2026-03-10'), mkCheckIn('h1', '2026-03-07')]
    expect(getCurrentStreak(checkIns, 'h1')).toBe(1)
  })

  it('returns 0 for no check-ins', () => {
    expect(getCurrentStreak([], 'h1')).toBe(0)
  })
})

describe('getMaxStreak', () => {
  it('finds the longest run across multiple gaps', () => {
    // 5-day run: Mar 1–5, gap, then 3-day run: Mar 8–10
    const checkIns = [
      mkCheckIn('h1', '2026-03-01'),
      mkCheckIn('h1', '2026-03-02'),
      mkCheckIn('h1', '2026-03-03'),
      mkCheckIn('h1', '2026-03-04'),
      mkCheckIn('h1', '2026-03-05'),
      mkCheckIn('h1', '2026-03-08'),
      mkCheckIn('h1', '2026-03-09'),
      mkCheckIn('h1', '2026-03-10'),
    ]
    expect(getMaxStreak(checkIns, 'h1')).toBe(5)
  })

  it('returns 0 for empty check-ins', () => {
    expect(getMaxStreak([], 'h1')).toBe(0)
  })
})

describe('getTotalCompletions', () => {
  it('counts only completed check-ins, excludes failed', () => {
    const checkIns = [
      mkCheckIn('h1', '2026-03-06', 'completed'),
      mkCheckIn('h1', '2026-03-07', 'completed'),
      mkCheckIn('h1', '2026-03-08', 'completed'),
      mkCheckIn('h1', '2026-03-09', 'completed'),
      mkCheckIn('h1', '2026-03-10', 'failed'),
    ]
    expect(getTotalCompletions(checkIns, 'h1')).toBe(4)
  })
})

describe('getMissedDays', () => {
  it('returns 4 when habit created 7 days ago with 3 check-ins', () => {
    // created 2026-03-04, today 2026-03-10 → 7 days; 3 check-ins → 4 missed
    const checkIns = [
      mkCheckIn('h1', '2026-03-04'),
      mkCheckIn('h1', '2026-03-06'),
      mkCheckIn('h1', '2026-03-08'),
    ]
    expect(getMissedDays(checkIns, 'h1', '2026-03-04')).toBe(4)
  })

  it('returns 1 when created today with no check-ins', () => {
    expect(getMissedDays([], 'h1', '2026-03-10')).toBe(1)
  })
})
