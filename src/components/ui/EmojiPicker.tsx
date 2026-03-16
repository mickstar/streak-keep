const PRESET_EMOJIS = [
  '📚', '🏋️', '🧘', '🏃', '💧', '🥗', '😴', '✍️',
  '🎸', '🎨', '💻', '🗣️', '🧹', '🌿', '🚴', '🎯',
  '🧠', '💊', '☕', '🌅', '🙏', '📓', '🎵', '🐕',
]

interface EmojiPickerProps {
  value: string
  onChange: (emoji: string) => void
}

export default function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {PRESET_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onChange(emoji)}
          className={`
            emoji-btn text-xl w-10 h-10 rounded-xl flex items-center justify-center
            transition-all active:scale-90
            ${value === emoji ? 'ring-2 ring-white/60' : ''}
          `}
          aria-label={emoji}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
