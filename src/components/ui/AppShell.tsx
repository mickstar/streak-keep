import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function AppShell() {
  return (
    <div className="min-h-svh flex flex-col">
      {/* Page content — add bottom padding to avoid nav overlap */}
      <main className="flex-1 overflow-y-auto pb-20" style={{ paddingTop: 'var(--safe-top)' }}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
