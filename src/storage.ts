import type { AppData } from './types'

const STORAGE_KEY = 'streak-keep:data'

export const CURRENT_VERSION = 1

const EMPTY: AppData = { habits: [], checkIns: [], notes: [], version: CURRENT_VERSION }

// ---------------------------------------------------------------------------
// Migration runner
// ---------------------------------------------------------------------------

type RawData = Record<string, unknown>

// Each migration receives the raw object at version N and returns it at N+1.
// Migrations are append-only — never edit an existing entry.
const migrations: Array<(data: RawData) => RawData> = [
  // v0 → v1: backfill status on check-ins, ensure notes array exists, remove orphan notes
  (data) => {
    const checkIns = (data.checkIns as Array<Record<string, unknown>>) ?? []
    const notes = (data.notes as Array<Record<string, unknown>>) ?? []
    return {
      ...data,
      checkIns: checkIns.map((c) => ({ ...c, status: c.status ?? 'completed' })),
      notes: notes.filter((n) => !!n.habitId),
      version: 1,
    }
  },
]

export function runMigrations(raw: RawData, fromVersion: number): AppData {
  let data = { ...raw }
  for (let v = fromVersion; v < CURRENT_VERSION; v++) {
    data = migrations[v](data)
  }
  // Ensure version is always set to current after all migrations
  data.version = CURRENT_VERSION
  return data as unknown as AppData
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function loadData(): AppData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return EMPTY
    const raw = JSON.parse(stored) as RawData
    const fromVersion = typeof raw.version === 'number' ? raw.version : 0
    if (fromVersion === CURRENT_VERSION) return raw as unknown as AppData
    const migrated = runMigrations(raw, fromVersion)
    saveData(migrated)
    return migrated
  } catch {
    return EMPTY
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function generateId(): string {
  // crypto.randomUUID is available in all modern browsers
  return crypto.randomUUID()
}

/** Returns today's date as YYYY-MM-DD in local time */
export function toLocalDate(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
