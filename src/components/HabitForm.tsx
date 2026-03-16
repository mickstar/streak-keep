import { useState } from 'react'
import type { FormEvent } from 'react'
import { DEFAULT_COLOR } from '../constants/colors'
import { toLocalDate } from '../storage'
import Button from './ui/Button'
import ColorPicker from './ui/ColorPicker'
import EmojiPicker from './ui/EmojiPicker'

export interface HabitFormValues {
  name: string
  icon: string
  color: string
  startedAt?: string // YYYY-MM-DD, only meaningful on create
}

interface HabitFormProps {
  initial?: Partial<HabitFormValues>
  onSubmit: (values: HabitFormValues) => void
  submitLabel?: string
  showStartedAt?: boolean
}

export default function HabitForm({
  initial,
  onSubmit,
  submitLabel = 'Save',
  showStartedAt = false,
}: HabitFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '📚')
  const [color, setColor] = useState(initial?.color ?? DEFAULT_COLOR.key)
  const [startedAt, setStartedAt] = useState(initial?.startedAt ?? toLocalDate())
  const [nameError, setNameError] = useState('')

  const today = toLocalDate()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Name cannot be empty')
      return
    }
    setNameError('')
    onSubmit({ name: trimmed, icon, color, ...(showStartedAt ? { startedAt } : {}) })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Name */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
          Habit name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError('') }}
          placeholder="e.g. Study session"
          maxLength={60}
          className={`glass rounded-xl px-4 h-12 outline-none focus:ring-2 focus:ring-[var(--border-2)] ${nameError ? 'ring-2 ring-rose-500/60' : ''}`}
          style={{ color: 'var(--text)', caretColor: 'var(--text)' }}
        />
        {nameError && <p className="text-rose-400 text-xs">{nameError}</p>}
      </div>

      {/* Icon */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
          Icon
        </label>
        <EmojiPicker value={icon} onChange={setIcon} />
      </div>

      {/* Color */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
          Color
        </label>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      {/* Started on — only shown on habit creation */}
      {showStartedAt && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
            When did you start?
          </label>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>
            We'll mark every day from this date through yesterday as completed.
          </p>
          <input
            type="date"
            value={startedAt}
            max={today}
            onChange={(e) => setStartedAt(e.target.value)}
            className="glass rounded-xl px-4 h-12 outline-none focus:ring-2 focus:ring-[var(--border-2)]"
            style={{ color: 'var(--text)', colorScheme: 'light dark' }}
          />
        </div>
      )}

      <Button type="submit" variant="primary" className="mt-2 self-stretch justify-center">
        {submitLabel}
      </Button>
    </form>
  )
}
