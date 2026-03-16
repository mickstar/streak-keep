interface StatTile {
  label: string
  value: number | string
  icon: string
}

interface StatsGridProps {
  currentStreak: number
  maxStreak: number
  totalCompletions: number
  missedDays: number
}

export default function StatsGrid({
  currentStreak,
  maxStreak,
  totalCompletions,
  missedDays,
}: StatsGridProps) {
  const tiles: StatTile[] = [
    { label: 'Current Streak', value: currentStreak, icon: '🔥' },
    { label: 'Best Streak',    value: maxStreak,      icon: '🏆' },
    { label: 'Total Done',     value: totalCompletions, icon: '✅' },
    { label: 'Missed Days',    value: missedDays,     icon: '😶' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {tiles.map(({ label, value, icon }) => (
        <div key={label} className="glass rounded-2xl p-4 flex flex-col gap-1">
          <div className="text-2xl">{icon}</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{value}</div>
          <div className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{label}</div>
        </div>
      ))}
    </div>
  )
}
