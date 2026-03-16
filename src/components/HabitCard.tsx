import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CheckIn, Habit } from '../types'
import { getAccentColor } from '../constants/colors'
import { getCurrentStreak } from '../streaks'
import { toLocalDate } from '../storage'

interface HabitCardProps {
  habit: Habit
  checkIns: CheckIn[]
  onCheckIn: (habitId: string) => void
  onFail: (habitId: string) => void
}

export default function HabitCard({ habit, checkIns, onCheckIn, onFail }: HabitCardProps) {
  const navigate = useNavigate()
  const accent = getAccentColor(habit.color)

  const today = toLocalDate()
  const todayCheckIn = useMemo(
    () => checkIns.find((c) => c.habitId === habit.id && c.date === today),
    [checkIns, habit.id, today],
  )
  const todayStatus = todayCheckIn?.status ?? null
  const streak = useMemo(() => getCurrentStreak(checkIns, habit.id), [checkIns, habit.id])

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        {/* Icon */}
        <button
          onClick={() => navigate(`/habits/${habit.id}`)}
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform active:scale-90"
          style={{ background: `${accent.hex}22` }}
          aria-label={`View ${habit.name} details`}
        >
          {habit.icon}
        </button>

        {/* Name + streak */}
        <button
          className="flex-1 text-left min-h-[44px] flex flex-col justify-center"
          onClick={() => navigate(`/habits/${habit.id}`)}
        >
          <span className="font-semibold leading-tight" style={{ color: 'var(--text)' }}>
            {habit.name}
          </span>
          <span className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>
            {streak > 0 ? `${streak} day streak 🔥` : 'Start your streak!'}
          </span>
        </button>

        {/* Fail button */}
        <button
          onClick={() => onFail(habit.id)}
          aria-label={todayStatus === 'failed' ? 'Marked as failed' : 'Mark as failed'}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 active:scale-90"
          style={
            todayStatus === 'failed'
              ? { background: '#ef4444' }
              : { border: '2px solid #ef444466' }
          }
        >
          {todayStatus === 'failed' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2} className="w-5 h-5" style={{ opacity: 0.5 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>

        {/* Check-in button */}
        <button
          onClick={() => onCheckIn(habit.id)}
          aria-label={todayStatus === 'completed' ? 'Completed' : 'Mark as done'}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 active:scale-90"
          style={
            todayStatus === 'completed'
              ? { background: accent.hex }
              : { border: '2px solid var(--border-2)' }
          }
        >
          {todayStatus === 'completed' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <div className="w-5 h-5 rounded-full" style={{ border: '2px solid var(--border-2)' }} />
          )}
        </button>
      </div>

      {/* Add note */}
      <div className="px-4 pb-3">
        <button
          onClick={() => navigate(`/diary/new?date=${today}&habitId=${habit.id}`)}
          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-3)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add note
        </button>
      </div>
    </div>
  )
}
