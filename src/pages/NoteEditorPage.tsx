import { useState } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { toLocalDate } from '../storage'

export default function NoteEditorPage() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  // `id` is a note ID on /diary/:id/edit, or a habit ID on /habits/:id/notes/new
  const { id } = useParams<{ id: string }>()

  const existingNote = id ? state.notes.find((n) => n.id === id) : undefined
  const isEdit = !!existingNote

  const date = existingNote?.date ?? searchParams.get('date') ?? toLocalDate()
  // Resolve habitId: from existing note > route param (habit-scoped new) > search param
  const habitId = existingNote?.habitId ?? (!isEdit && id ? id : undefined) ?? searchParams.get('habitId') ?? undefined
  const habit = habitId ? state.habits.find((h) => h.id === habitId) : undefined
  const [body, setBody] = useState(existingNote?.body ?? '')

  const canSave = body.trim().length > 0 && (isEdit || !!habitId)

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  function handleSave() {
    if (!canSave) return
    if (isEdit && existingNote) {
      dispatch({ type: 'UPDATE_NOTE', payload: { id: existingNote.id, body: body.trim() } })
    } else if (habitId) {
      dispatch({ type: 'ADD_NOTE', payload: { date, body: body.trim(), habitId } })
    }
    navigate(-1)
  }

  function handleDelete() {
    if (!existingNote) return
    if (window.confirm('Delete this note? This cannot be undone.')) {
      dispatch({ type: 'DELETE_NOTE', payload: { id: existingNote.id } })
      navigate('/diary', { replace: true })
    }
  }

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2"
          style={{ color: 'var(--text-2)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          {habit && (
            <p className="text-xs font-medium mb-0.5 truncate" style={{ color: 'var(--text-3)' }}>
              {habit.icon} {habit.name}
            </p>
          )}
          <h1 className="text-xl font-semibold">{isEdit ? 'Edit note' : 'New note'}</h1>
          <p className="text-sm truncate" style={{ color: 'var(--text-2)' }}>{dateLabel}</p>
        </div>
        {isEdit && (
          <button
            onClick={handleDelete}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: 'var(--text-3)' }}
            aria-label="Delete note"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}
      </div>

      {/* Textarea */}
      <textarea
        className="flex-1 w-full rounded-2xl p-4 text-base resize-none outline-none min-h-[280px]"
        style={{
          background: 'var(--surface-2)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
        }}
        placeholder="Write something…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        autoFocus
      />

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!canSave}
        className="mt-4 w-full h-12 rounded-2xl font-semibold text-base transition-opacity"
        style={{
          background: canSave ? 'var(--accent)' : 'var(--surface-2)',
          color: canSave ? '#fff' : 'var(--text-3)',
          opacity: canSave ? 1 : 0.5,
          cursor: canSave ? 'pointer' : 'not-allowed',
        }}
      >
        {isEdit ? 'Save changes' : 'Save note'}
      </button>
    </div>
  )
}
