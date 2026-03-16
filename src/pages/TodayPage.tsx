import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import HabitCard from '../components/HabitCard'
import Button from '../components/ui/Button'
import { toLocalDate } from '../storage'

export default function TodayPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  const active = state.habits.filter((h) => !h.archivedAt)
  const today = toLocalDate()
  const completedToday = state.checkIns.filter(
    (c) => c.date === today && c.status === 'completed',
  ).length

  function handleCheckIn(habitId: string) {
    dispatch({ type: 'RECORD_DAY_STATUS', payload: { habitId, status: 'completed' } })
  }

  function handleFail(habitId: string) {
    dispatch({ type: 'RECORD_DAY_STATUS', payload: { habitId, status: 'failed' } })
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const dateLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>{dateLabel}</p>
        <h1 className="text-2xl font-bold mt-1">{greeting()} 👋</h1>
        {active.length > 0 && (
          <p className="text-sm mt-2" style={{ color: 'var(--text-2)' }}>
            {completedToday}/{active.length} habits done today
          </p>
        )}
      </div>

      {/* Empty state */}
      {active.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-2)' }}>No habits yet</p>
          <p className="text-sm mb-8" style={{ color: 'var(--text-3)' }}>
            Start building streaks by adding your first habit.
          </p>
          <Button variant="primary" onClick={() => navigate('/habits/new')}>
            Add a habit
          </Button>
        </div>
      )}

      {/* Habits list */}
      <div className="flex flex-col gap-3">
        {active.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            checkIns={state.checkIns}
            onCheckIn={handleCheckIn}
            onFail={handleFail}
          />
        ))}
      </div>

      {/* All done banner */}
      {active.length > 0 && completedToday === active.length && (
        <div className="mt-6 glass rounded-2xl p-4 text-center">
          <div className="text-3xl mb-1">🎉</div>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>All done for today!</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Keep it up — see you tomorrow.</p>
        </div>
      )}
    </div>
  )
}
