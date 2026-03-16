export interface AccentColor {
  key: string
  label: string
  /** Tailwind bg class for filled/active states */
  bg: string
  /** Tailwind text class for use on dark backgrounds */
  text: string
  /** Hex for inline style use (e.g. calendar cells) */
  hex: string
}

export const ACCENT_COLORS: AccentColor[] = [
  { key: 'violet',  label: 'Violet',  bg: 'bg-violet-500',  text: 'text-violet-400',  hex: '#8b5cf6' },
  { key: 'indigo',  label: 'Indigo',  bg: 'bg-indigo-500',  text: 'text-indigo-400',  hex: '#6366f1' },
  { key: 'sky',     label: 'Sky',     bg: 'bg-sky-500',     text: 'text-sky-400',     hex: '#0ea5e9' },
  { key: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-400', hex: '#10b981' },
  { key: 'amber',   label: 'Amber',   bg: 'bg-amber-500',   text: 'text-amber-400',   hex: '#f59e0b' },
  { key: 'rose',    label: 'Rose',    bg: 'bg-rose-500',    text: 'text-rose-400',    hex: '#f43f5e' },
  { key: 'pink',    label: 'Pink',    bg: 'bg-pink-500',    text: 'text-pink-400',    hex: '#ec4899' },
  { key: 'teal',    label: 'Teal',    bg: 'bg-teal-500',    text: 'text-teal-400',    hex: '#14b8a6' },
]

export const DEFAULT_COLOR = ACCENT_COLORS[0]

export function getAccentColor(key: string): AccentColor {
  return ACCENT_COLORS.find((c) => c.key === key) ?? DEFAULT_COLOR
}
