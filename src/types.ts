export interface Habit {
  id: string
  name: string
  icon: string        // emoji
  color: string       // color key from ACCENT_COLORS
  createdAt: string   // ISO date string
  archivedAt?: string // ISO date string, soft delete
}

export interface CheckIn {
  habitId: string
  date: string        // YYYY-MM-DD local date
  completedAt: string // ISO timestamp
  status: 'completed' | 'failed'
}

export interface Note {
  id: string
  date: string      // YYYY-MM-DD local date
  body: string
  createdAt: string // ISO timestamp
  habitId: string   // links note to a specific habit
}

export interface AppData {
  habits: Habit[]
  checkIns: CheckIn[]
  notes: Note[]
  version?: number
}
