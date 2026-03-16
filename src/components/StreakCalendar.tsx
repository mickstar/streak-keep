import { useState, useMemo } from 'react'
import type { CheckIn } from '../types'
import { toLocalDate } from '../storage'
import { getAccentColor } from '../constants/colors'

interface StreakCalendarProps {
  checkIns: CheckIn[]
  habitId: string
  habitColor: string
  createdAt: string
  onToggle?: (date: string) => void
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function ymd(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function StreakCalendar({
  checkIns,
  habitId,
  habitColor,
  createdAt,
  onToggle,
}: StreakCalendarProps) {
  const today = toLocalDate()
  const todayDate = new Date(today + 'T12:00:00')
  const creationDate = toLocalDate(new Date(createdAt))

  // Determine min/max months
  const [minYear, minRawMonth] = creationDate.split('-').map(Number)
  const minMonth = minRawMonth - 1
  const [maxYear, maxMonth] = [todayDate.getFullYear(), todayDate.getMonth()]

  const [viewYear, setViewYear] = useState(maxYear)
  const [viewMonth, setViewMonth] = useState(maxMonth)

  const accent = getAccentColor(habitColor)

  const completedSet = useMemo(() => {
    return new Set(
      checkIns.filter((c) => c.habitId === habitId && c.status === 'completed').map((c) => c.date),
    )
  }, [checkIns, habitId])

  const failedSet = useMemo(() => {
    return new Set(
      checkIns.filter((c) => c.habitId === habitId && c.status === 'failed').map((c) => c.date),
    )
  }, [checkIns, habitId])

  const atMin = viewYear === minYear && viewMonth === minMonth
  const atMax = viewYear === maxYear && viewMonth === maxMonth

  function prevMonth() {
    if (atMin) return
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11) }
    else setViewMonth(viewMonth - 1)
  }

  function nextMonth() {
    if (atMax) return
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0) }
    else setViewMonth(viewMonth + 1)
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="glass rounded-2xl p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={atMin}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-20 transition-colors"
          style={{ color: 'var(--text-2)' }}
          aria-label="Previous month"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h3 className="font-semibold" style={{ color: 'var(--text)' }}>
          {MONTHS[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={nextMonth}
          disabled={atMax}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center disabled:opacity-20 transition-colors"
          style={{ color: 'var(--text-2)' }}
          aria-label="Next month"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium py-1" style={{ color: 'var(--text-3)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />

          const dateStr = ymd(viewYear, viewMonth, day)
          const isCompleted = completedSet.has(dateStr)
          const isFailed = failedSet.has(dateStr)
          const isToday = dateStr === today
          const isFuture = dateStr > today
          const isBeforeCreation = dateStr < creationDate
          const isToggleable = onToggle && !isFuture && !isBeforeCreation

          const cellContent = (
            <div
              className="aspect-square flex items-center justify-center rounded-full text-xs font-medium"
              style={{
                backgroundColor: isCompleted
                  ? accent.hex
                  : isFailed
                  ? '#ef444466'
                  : undefined,
                color: isCompleted || isFailed
                  ? isCompleted ? 'white' : '#ef4444'
                  : isBeforeCreation || isFuture
                  ? 'var(--text-3)'
                  : isToday
                  ? 'var(--text)'
                  : 'var(--text-3)',
                opacity: isBeforeCreation || isFuture ? 0.35 : 1,
                outline: isToday && !isCompleted && !isFailed ? '2px solid var(--border-2)' : undefined,
                outlineOffset: isToday && !isCompleted && !isFailed ? '1px' : undefined,
              }}
            >
              {day}
            </div>
          )

          if (isToggleable) {
            return (
              <button
                key={dateStr}
                onClick={() => onToggle(dateStr)}
                className="active:scale-90 transition-transform"
                aria-label={`${isCompleted ? 'Remove' : 'Add'} check-in for ${dateStr}`}
                title={isCompleted ? 'Tap to remove' : 'Tap to mark done'}
              >
                {cellContent}
              </button>
            )
          }

          return <div key={dateStr}>{cellContent}</div>
        })}
      </div>

      {onToggle && (
        <p className="text-center text-[11px] mt-3" style={{ color: 'var(--text-3)' }}>
          Tap any past day to add or remove a check-in
        </p>
      )}
    </div>
  )
}
