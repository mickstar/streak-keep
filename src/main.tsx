import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AppProvider } from './context/AppContext'
import { BiometricAuthProvider, useBiometricAuth } from './context/BiometricAuthContext'
import AppShell from './components/ui/AppShell'
import LockScreen from './components/LockScreen'
import TodayPage from './pages/TodayPage'
import HabitsPage from './pages/HabitsPage'
import NewHabitPage from './pages/NewHabitPage'
import EditHabitPage from './pages/EditHabitPage'
import HabitDetailPage from './pages/HabitDetailPage'
import DiaryPage from './pages/DiaryPage'
import NoteEditorPage from './pages/NoteEditorPage'
import SettingsPage from './pages/SettingsPage'

function AppRoutes() {
  const { isEnabled, isUnlocked } = useBiometricAuth()
  return (
    <>
      {isEnabled && !isUnlocked && <LockScreen />}
      <BrowserRouter basename="/streak-keep">
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<TodayPage />} />
            <Route path="habits" element={<HabitsPage />} />
            <Route path="habits/new" element={<NewHabitPage />} />
            <Route path="habits/:id" element={<HabitDetailPage />} />
            <Route path="habits/:id/edit" element={<EditHabitPage />} />
            <Route path="diary" element={<DiaryPage />} />
            <Route path="diary/new" element={<NoteEditorPage />} />
            <Route path="diary/:id/edit" element={<NoteEditorPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <BiometricAuthProvider>
        <AppRoutes />
      </BiometricAuthProvider>
    </AppProvider>
  </StrictMode>,
)
