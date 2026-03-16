import { ACCENT_COLORS } from '../../constants/colors'

interface ColorPickerProps {
  value: string
  onChange: (key: string) => void
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {ACCENT_COLORS.map((color) => (
        <button
          key={color.key}
          type="button"
          onClick={() => onChange(color.key)}
          className={`
            w-9 h-9 rounded-full transition-all
            ${color.bg}
            ${value === color.key ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110' : 'opacity-70 hover:opacity-100'}
          `}
          aria-label={color.label}
          title={color.label}
        />
      ))}
    </div>
  )
}
