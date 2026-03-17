import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react'
import type { AppData, Habit, CheckIn, Note } from '../types'
import { loadData, saveData, generateId, toLocalDate } from '../storage'

// ── Actions ──────────────────────────────────────────────────

type Action =
  | { type: 'ADD_HABIT'; payload: Omit<Habit, 'id' | 'createdAt'> & { startedAt?: string } }
  | { type: 'EDIT_HABIT'; payload: Pick<Habit, 'id'> & Partial<Omit<Habit, 'id' | 'createdAt'>> }
  | { type: 'DELETE_HABIT'; payload: { id: string } }
  | { type: 'ADD_CHECK_IN'; payload: { habitId: string } }
  | { type: 'RECORD_DAY_STATUS'; payload: { habitId: string; status: 'completed' | 'failed'; date?: string } }
  | { type: 'TOGGLE_CHECK_IN'; payload: { habitId: string; date: string } }
  | { type: 'REMOVE_CHECK_IN'; payload: { habitId: string; date: string } }
  | { type: 'ADD_NOTE'; payload: { date: string; body: string; habitId: string } }
  | { type: 'UPDATE_NOTE'; payload: { id: string; body: string } }
  | { type: 'DELETE_NOTE'; payload: { id: string } }

// ── Reducer ───────────────────────────────────────────────────

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case 'ADD_HABIT': {
      const { startedAt, ...rest } = action.payload
      const habit: Habit = {
        ...rest,
        id: generateId(),
        // Allow setting a past start date for backfilling streaks
        createdAt: startedAt ? new Date(startedAt + 'T00:00:00').toISOString() : new Date().toISOString(),
      }

      // Auto-generate completed check-ins from startedAt through yesterday
      const today = toLocalDate()
      const backfilledCheckIns: CheckIn[] = []
      if (startedAt && startedAt < today) {
        const now = new Date().toISOString()
        let cursor = new Date(startedAt + 'T12:00:00')
        const yesterday = new Date(today + 'T12:00:00')
        yesterday.setDate(yesterday.getDate() - 1)
        while (cursor <= yesterday) {
          const dateStr = toLocalDate(cursor)
          backfilledCheckIns.push({ habitId: habit.id, date: dateStr, completedAt: now, status: 'completed' })
          cursor.setDate(cursor.getDate() + 1)
        }
      }

      return {
        ...state,
        habits: [...state.habits, habit],
        checkIns: [...state.checkIns, ...backfilledCheckIns],
      }
    }

    case 'EDIT_HABIT': {
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.payload.id ? { ...h, ...action.payload } : h,
        ),
      }
    }

    case 'DELETE_HABIT': {
      return {
        ...state,
        habits: state.habits.filter((h) => h.id !== action.payload.id),
        checkIns: state.checkIns.filter((c) => c.habitId !== action.payload.id),
      }
    }

    case 'ADD_CHECK_IN': {
      const today = toLocalDate()
      const filtered = state.checkIns.filter(
        (c) => !(c.habitId === action.payload.habitId && c.date === today),
      )
      const checkIn: CheckIn = {
        habitId: action.payload.habitId,
        date: today,
        completedAt: new Date().toISOString(),
        status: 'completed',
      }
      return { ...state, checkIns: [...filtered, checkIn] }
    }

    case 'RECORD_DAY_STATUS': {
      const date = action.payload.date ?? toLocalDate()
      const filtered = state.checkIns.filter(
        (c) => !(c.habitId === action.payload.habitId && c.date === date),
      )
      const checkIn: CheckIn = {
        habitId: action.payload.habitId,
        date,
        completedAt: new Date().toISOString(),
        status: action.payload.status,
      }
      return { ...state, checkIns: [...filtered, checkIn] }
    }

    case 'TOGGLE_CHECK_IN': {
      const { habitId, date } = action.payload
      const exists = state.checkIns.some((c) => c.habitId === habitId && c.date === date)
      if (exists) {
        // Remove the check-in (un-mark the day)
        return {
          ...state,
          checkIns: state.checkIns.filter((c) => !(c.habitId === habitId && c.date === date)),
        }
      }
      // Add a backfilled check-in
      const checkIn: CheckIn = {
        habitId,
        date,
        completedAt: new Date().toISOString(),
        status: 'completed',
      }
      return { ...state, checkIns: [...state.checkIns, checkIn] }
    }

    case 'REMOVE_CHECK_IN': {
      const { habitId, date } = action.payload
      return {
        ...state,
        checkIns: state.checkIns.filter((c) => !(c.habitId === habitId && c.date === date)),
      }
    }

    case 'ADD_NOTE': {
      const note: Note = {
        id: generateId(),
        date: action.payload.date,
        body: action.payload.body,
        habitId: action.payload.habitId,
        createdAt: new Date().toISOString(),
      }
      return { ...state, notes: [...state.notes, note] }
    }

    case 'UPDATE_NOTE': {
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.payload.id ? { ...n, body: action.payload.body } : n,
        ),
      }
    }

    case 'DELETE_NOTE': {
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.payload.id),
      }
    }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────

interface AppContextValue {
  state: AppData
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadData)

  useEffect(() => {
    saveData(state)
  }, [state])

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
