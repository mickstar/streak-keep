import { describe, it, expect } from 'vitest'
import { toLocalDate } from '../storage'

describe('toLocalDate', () => {
  it('returns YYYY-MM-DD for a specific Date', () => {
    const date = new Date(2026, 2, 17) // March 17, 2026 (month is 0-indexed)
    expect(toLocalDate(date)).toBe('2026-03-17')
  })

  it('returns today\'s date when called with no arguments', () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    expect(toLocalDate()).toBe(`${y}-${m}-${d}`)
  })
})
