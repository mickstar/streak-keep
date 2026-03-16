import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getAccentColor } from '../constants/colors'
import GlassCard from '../components/ui/GlassCard'
import Button from '../components/ui/Button'

export default function HabitsPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const active = state.habits.filter((h) => !h.archivedAt)

  function confirmDelete(id: string) {
    setConfirmDeleteId(id)
  }

  function handleDelete() {
    if (!confirmDeleteId) return
    dispatch({ type: 'DELETE_HABIT', payload: { id: confirmDeleteId } })
    setConfirmDeleteId(null)
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Habits</h1>
        <Button variant="primary" onClick={() => navigate('/habits/new')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New
        </Button>
      </div>

      {/* Empty state */}
      {active.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-lg mb-6" style={{ color: 'var(--text-2)' }}>No habits yet</p>
          <Button variant="primary" onClick={() => navigate('/habits/new')}>
            Add your first habit
          </Button>
        </div>
      )}

      {/* Habits list */}
      <div className="flex flex-col gap-3">
        {active.map((habit) => {
          const accent = getAccentColor(habit.color)
          return (
            <GlassCard key={habit.id} className="flex items-center gap-4">
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${accent.bg} bg-opacity-30`}
              >
                {habit.icon}
              </div>

              {/* Name */}
              <button
                className="flex-1 text-left min-h-[44px] flex items-center"
                onClick={() => navigate(`/habits/${habit.id}`)}
              >
                <span className="font-medium" style={{ color: 'var(--text)' }}>{habit.name}</span>
              </button>

              {/* Actions */}
              <div className="flex gap-1">
                <button
                  onClick={() => navigate(`/habits/${habit.id}/edit`)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-white transition-colors"
                  style={{ color: 'var(--text-3)' }}
                  aria-label="Edit"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </button>
                <button
                  onClick={() => confirmDelete(habit.id)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center hover:text-rose-400 transition-colors"
                  style={{ color: 'var(--text-3)' }}
                  aria-label="Delete"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Delete confirmation overlay */}
      {confirmDeleteId && (
        <div className="fixed inset-0 flex items-end justify-center p-4 bg-black/50 z-50" onClick={() => setConfirmDeleteId(null)}>
          <div
            className="glass rounded-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-2">Delete habit?</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>
              This will permanently delete the habit and all its check-in history.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
