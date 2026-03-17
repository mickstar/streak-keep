import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function DiaryPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()

  // Filter notes to only those with a valid habitId, sorted newest first
  const validHabitIds = new Set(state.habits.map((h) => h.id))
  const sorted = [...state.notes]
    .filter((n) => validHabitIds.has(n.habitId))
    .sort((a, b) => b.date.localeCompare(a.date))

  function handleDelete(id: string) {
    if (window.confirm('Delete this note? This cannot be undone.')) {
      dispatch({ type: 'DELETE_NOTE', payload: { id } })
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Diary</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
          {sorted.length === 0
            ? 'No entries yet'
            : `${sorted.length} ${sorted.length === 1 ? 'entry' : 'entries'}`}
        </p>
      </div>

      {/* Empty state */}
      {sorted.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📓</div>
          <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-2)' }}>No notes yet</p>
          <p className="text-sm mb-8" style={{ color: 'var(--text-3)' }}>
            Capture thoughts, reflections, or context for your day.
          </p>
        </div>
      )}

      {/* Notes list */}
      <div className="flex flex-col gap-4">
        {sorted.map((note) => {
          const habit = state.habits.find((h) => h.id === note.habitId)
          return (
          <div
            key={note.id}
            className="rounded-2xl p-4"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            {habit && (
              <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--text-3)' }}>
                {habit.icon} {habit.name}
              </p>
            )}
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>
                {formatDate(note.date)}
              </p>
              <div className="flex items-center gap-1 shrink-0">
                {/* Edit */}
                <button
                  onClick={() => navigate(`/diary/${note.id}/edit`)}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                  style={{ color: 'var(--text-3)' }}
                  aria-label="Edit note"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </button>
                {/* Delete */}
                <button
                  onClick={() => handleDelete(note.id)}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                  style={{ color: 'var(--text-3)' }}
                  aria-label="Delete note"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{note.body}</p>
          </div>
          )
        })}
      </div>

    </div>
  )
}
