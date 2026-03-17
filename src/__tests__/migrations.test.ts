import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runMigrations, loadData, saveData, CURRENT_VERSION } from '../storage'

// ---------------------------------------------------------------------------
// runMigrations — pure function tests (no localStorage needed)
// ---------------------------------------------------------------------------

describe('runMigrations', () => {
  describe('v0 → v1', () => {
    it('backfills status: "completed" on check-ins missing the field', () => {
      const v0 = {
        habits: [{ id: 'h1', name: 'Run', icon: '🏃', color: 'indigo', createdAt: '2026-01-01' }],
        checkIns: [
          { habitId: 'h1', date: '2026-03-10', completedAt: '2026-03-10T08:00:00Z' },
          { habitId: 'h1', date: '2026-03-11', completedAt: '2026-03-11T08:00:00Z' },
        ],
        // no notes key, no version key
      }
      const result = runMigrations(v0, 0)
      expect(result.checkIns[0].status).toBe('completed')
      expect(result.checkIns[1].status).toBe('completed')
    })

    it('preserves existing status values', () => {
      const v0 = {
        habits: [],
        checkIns: [
          { habitId: 'h1', date: '2026-03-10', completedAt: '2026-03-10T08:00:00Z', status: 'failed' },
        ],
      }
      const result = runMigrations(v0, 0)
      expect(result.checkIns[0].status).toBe('failed')
    })

    it('initialises missing notes array as empty', () => {
      const v0 = { habits: [], checkIns: [] }
      const result = runMigrations(v0, 0)
      expect(result.notes).toEqual([])
    })

    it('filters out orphan notes without habitId', () => {
      const v0 = {
        habits: [],
        checkIns: [],
        notes: [
          { id: 'n1', date: '2026-03-10', body: 'good run', createdAt: '2026-03-10T09:00:00Z', habitId: 'h1' },
          { id: 'n2', date: '2026-03-10', body: 'orphan',   createdAt: '2026-03-10T09:00:00Z' }, // no habitId
        ],
      }
      const result = runMigrations(v0, 0)
      expect(result.notes).toHaveLength(1)
      expect(result.notes[0].id).toBe('n1')
    })

    it('sets version to 1', () => {
      const result = runMigrations({ habits: [], checkIns: [] }, 0)
      expect(result.version).toBe(1)
    })

    it('preserves unrelated habit fields', () => {
      const habit = { id: 'h1', name: 'Read', icon: '📚', color: 'blue', createdAt: '2026-01-01' }
      const result = runMigrations({ habits: [habit], checkIns: [] }, 0)
      expect(result.habits[0]).toMatchObject(habit)
    })
  })

  describe('already at current version', () => {
    it('returns data unchanged when fromVersion === CURRENT_VERSION', () => {
      const v1 = {
        habits: [{ id: 'h1', name: 'Run', icon: '🏃', color: 'indigo', createdAt: '2026-01-01' }],
        checkIns: [{ habitId: 'h1', date: '2026-03-10', completedAt: '2026-03-10T08:00:00Z', status: 'completed' as const }],
        notes: [],
        version: CURRENT_VERSION,
      }
      // runMigrations with fromVersion === CURRENT_VERSION should apply no migrations
      const result = runMigrations(v1, CURRENT_VERSION)
      expect(result).toEqual({ ...v1, version: CURRENT_VERSION })
    })
  })
})

// ---------------------------------------------------------------------------
// loadData — integration tests with mocked localStorage
// ---------------------------------------------------------------------------

function makeMockStorage(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial }
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]) }),
    get _store() { return store },
  }
}

describe('loadData', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns EMPTY when no data in storage', () => {
    vi.stubGlobal('localStorage', makeMockStorage())
    const result = loadData()
    expect(result.habits).toEqual([])
    expect(result.checkIns).toEqual([])
    expect(result.notes).toEqual([])
    expect(result.version).toBe(CURRENT_VERSION)
  })

  it('writes back migrated data to localStorage', () => {
    const v0 = JSON.stringify({
      habits: [{ id: 'h1', name: 'Run', icon: '🏃', color: 'indigo', createdAt: '2026-01-01' }],
      checkIns: [{ habitId: 'h1', date: '2026-03-10', completedAt: '2026-03-10T08:00:00Z' }],
    })
    const mock = makeMockStorage({ 'streak-keep:data': v0 })
    vi.stubGlobal('localStorage', mock)

    loadData()

    expect(mock.setItem).toHaveBeenCalledOnce()
    const written = JSON.parse(mock.setItem.mock.calls[0][1] as string)
    expect(written.version).toBe(CURRENT_VERSION)
    expect(written.checkIns[0].status).toBe('completed')
  })

  it('does not write back when data is already at current version', () => {
    const v1 = JSON.stringify({
      habits: [],
      checkIns: [],
      notes: [],
      version: CURRENT_VERSION,
    })
    const mock = makeMockStorage({ 'streak-keep:data': v1 })
    vi.stubGlobal('localStorage', mock)

    loadData()

    expect(mock.setItem).not.toHaveBeenCalled()
  })

  it('returns EMPTY on malformed JSON', () => {
    vi.stubGlobal('localStorage', makeMockStorage({ 'streak-keep:data': 'not-json{{{' }))
    const result = loadData()
    expect(result.habits).toEqual([])
  })
})

// Task 3.4 placeholder — add multi-step migration test when a v1→v2 migration is introduced
