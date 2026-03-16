import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getAccentColor } from '../constants/colors'
import {
  getCurrentStreak,
  getMaxStreak,
  getTotalCompletions,
  getMissedDays,
} from '../streaks'
import { toLocalDate } from '../storage'
import StatsGrid from '../components/StatsGrid'
import StreakCalendar from '../components/StreakCalendar'

export default function HabitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const habit = state.habits.find((h) => h.id === id)

  if (!habit) {
    return (
      <div className="px-4 pt-12 text-center ">Habit not found.</div>
    )
  }

  const accent = getAccentColor(habit.color)
  const today = toLocalDate()
  const todayCheckIn = state.checkIns.find((c) => c.habitId === habit.id && c.date === today)
  const todayStatus = todayCheckIn?.status ?? null

  const stats = useMemo(() => ({
    current: getCurrentStreak(state.checkIns, habit.id),
    max: getMaxStreak(state.checkIns, habit.id),
    total: getTotalCompletions(state.checkIns, habit.id),
    missed: getMissedDays(state.checkIns, habit.id, habit.createdAt),
  }), [state.checkIns, habit.id, habit.createdAt])

  function handleCheckIn() {
    dispatch({ type: 'RECORD_DAY_STATUS', payload: { habitId: habit!.id, status: 'completed' } })
  }

  function handleFail() {
    dispatch({ type: 'RECORD_DAY_STATUS', payload: { habitId: habit!.id, status: 'failed' } })
  }

  function handleCycleDay(date: string) {
    const existing = state.checkIns.find((c) => c.habitId === habit!.id && c.date === date)
    if (!existing) {
      dispatch({ type: 'RECORD_DAY_STATUS', payload: { habitId: habit!.id, status: 'completed', date } })
    } else if (existing.status === 'completed') {
      dispatch({ type: 'RECORD_DAY_STATUS', payload: { habitId: habit!.id, status: 'failed', date } })
    } else {
      dispatch({ type: 'REMOVE_CHECK_IN', payload: { habitId: habit!.id, date } })
    }
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-white -ml-2"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${accent.hex}33` }}
        >
          {habit.icon}
        </div>
        <h1 className="flex-1 text-xl font-bold truncate">{habit.name}</h1>
        <button
          onClick={() => navigate(`/habits/${habit.id}/edit`)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-white"
          aria-label="Edit habit"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </button>
      </div>

      {/* Today actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={handleFail}
          className="h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all active:scale-[0.98]"
          style={todayStatus === 'failed' ? { background: '#ef4444' } : { border: '2px solid #ef444466' }}
          aria-label={todayStatus === 'failed' ? 'Marked as failed' : 'Mark as failed'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke={todayStatus === 'failed' ? 'white' : '#ef4444'} strokeWidth={2.5} className="w-5 h-5" style={{ opacity: todayStatus === 'failed' ? 1 : 0.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
          onClick={handleCheckIn}
          disabled={todayStatus === 'completed'}
          className="flex-1 h-14 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{ background: todayStatus === 'completed' ? `${accent.hex}66` : accent.hex, color: 'white', opacity: todayStatus === 'completed' ? 0.7 : 1 }}
        >
          {todayStatus === 'completed' ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Done today!
            </>
          ) : (
            <>
              <span className="text-xl">{habit.icon}</span>
              Mark as done today
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <StatsGrid
        currentStreak={stats.current}
        maxStreak={stats.max}
        totalCompletions={stats.total}
        missedDays={stats.missed}
      />

      {/* Calendar */}
      <div className="mt-4">
        <StreakCalendar
          checkIns={state.checkIns}
          habitId={habit.id}
          habitColor={habit.color}
          createdAt={habit.createdAt}
          onToggle={handleCycleDay}
        />
      </div>
    </div>
  )
}
