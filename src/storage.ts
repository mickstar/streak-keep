import type { AppData, CheckIn } from './types'

const STORAGE_KEY = 'streak-keep:data'

const EMPTY: AppData = { habits: [], checkIns: [], notes: [] }

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const data = JSON.parse(raw) as AppData
    // Default missing status to 'completed' for legacy check-ins
    data.checkIns = data.checkIns.map((c) => ({
      ...c,
      status: (c as CheckIn & { status?: 'completed' | 'failed' }).status ?? 'completed',
    }))
    // Default missing notes for legacy data
    data.notes = data.notes ?? []
    // Filter out orphan notes that have no habitId (legacy data migration)
    data.notes = data.notes.filter((n) => !!(n as { habitId?: string }).habitId)
    return data
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
