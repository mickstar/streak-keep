import type { CheckIn } from './types'
import { toLocalDate } from './storage'

/** Adds `days` calendar days to a YYYY-MM-DD string */
function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00') // noon to avoid DST edge cases
  d.setDate(d.getDate() + days)
  return toLocalDate(d)
}

/** Returns a Set of YYYY-MM-DD completed dates for a given habitId */
function dateSet(checkIns: CheckIn[], habitId: string): Set<string> {
  return new Set(
    checkIns
      .filter((c) => c.habitId === habitId && c.status === 'completed')
      .map((c) => c.date),
  )
}

/**
 * Current streak: consecutive days ending today (or yesterday if today not checked in).
 * If neither today nor yesterday has a check-in, streak is 0.
 */
export function getCurrentStreak(checkIns: CheckIn[], habitId: string): number {
  const dates = dateSet(checkIns, habitId)
  const today = toLocalDate()
  const yesterday = addDays(today, -1)

  // Start from today; fall back to yesterday if today not yet checked in
  let cursor = dates.has(today) ? today : dates.has(yesterday) ? yesterday : null
  if (!cursor) return 0

  let count = 0
  while (dates.has(cursor)) {
    count++
    cursor = addDays(cursor, -1)
  }
  return count
}

/**
 * Max streak: the longest consecutive run ever.
 */
export function getMaxStreak(checkIns: CheckIn[], habitId: string): number {
  const dates = dateSet(checkIns, habitId)
  if (dates.size === 0) return 0

  const sorted = [...dates].sort()
  let max = 1
  let run = 1

  for (let i = 1; i < sorted.length; i++) {
    if (addDays(sorted[i - 1], 1) === sorted[i]) {
      run++
      if (run > max) max = run
    } else {
      run = 1
    }
  }
  return max
}

/** Total number of completed check-ins for a habit */
export function getTotalCompletions(checkIns: CheckIn[], habitId: string): number {
  return checkIns.filter((c) => c.habitId === habitId && c.status === 'completed').length
}

/**
 * Missed days: days between habit creation and today (inclusive) with no check-in.
 * Days in the future are ignored.
 */
export function getMissedDays(
  checkIns: CheckIn[],
  habitId: string,
  createdAt: string,
): number {
  const dates = dateSet(checkIns, habitId)
  const today = toLocalDate()

  // Walk from creation date to today
  let cursor = toLocalDate(new Date(createdAt + 'T12:00:00'))
  let missed = 0
  while (cursor <= today) {
    if (!dates.has(cursor)) missed++
    cursor = addDays(cursor, 1)
  }
  return missed
}
