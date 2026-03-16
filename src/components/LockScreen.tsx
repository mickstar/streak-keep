import { useState } from 'react'
import { useBiometricAuth } from '../context/BiometricAuthContext'

export default function LockScreen() {
  const { unlock, authError, needsReenrollment, resetBiometric } = useBiometricAuth()
  const [confirmingWipe, setConfirmingWipe] = useState(false)

  function handleWipeConfirm() {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 px-8"
      style={{ background: 'var(--bg)' }}
    >
      {/* App branding */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          🔥
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Streak Keep</h1>
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>
          Your data is protected
        </p>
      </div>

      {needsReenrollment ? (
        // Re-enrollment prompt
        <div className="w-full max-w-xs flex flex-col items-center gap-4">
          <div
            className="rounded-2xl p-4 w-full text-center"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <p className="text-sm font-medium mb-1">Biometric data not found</p>
            <p className="text-xs" style={{ color: 'var(--text-2)' }}>
              Your saved credential is no longer valid. Reset the lock to re-enroll.
            </p>
          </div>
          <button
            onClick={resetBiometric}
            className="w-full py-3 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-80 btn-primary"
          >
            Reset Lock
          </button>
        </div>
      ) : (
        // Normal unlock UI
        <div className="w-full max-w-xs flex flex-col items-center gap-4">
          {authError && (
            <p className="text-sm text-center" style={{ color: '#ef4444' }}>
              {authError}
            </p>
          )}
          <button
            onClick={unlock}
            className="w-full py-3 rounded-2xl font-semibold text-sm transition-opacity hover:opacity-80 btn-primary flex items-center justify-center gap-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 11V7a5 5 0 0 1 10 0v4M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z"
              />
            </svg>
            Unlock
          </button>
        </div>
      )}

      {/* Lost access escape hatch */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center" style={{ paddingBottom: 'var(--safe-bottom)' }}>
        {confirmingWipe ? (
          <div
            className="mx-8 rounded-2xl p-4 flex flex-col gap-3 w-full max-w-xs"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div>
              <p className="text-sm font-semibold mb-1">Erase all data?</p>
              <p className="text-xs" style={{ color: 'var(--text-2)' }}>
                This will permanently delete all your habits, check-ins, and diary entries. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingWipe(false)}
                className="flex-1 py-2 rounded-xl text-sm font-medium btn-secondary border"
              >
                Cancel
              </button>
              <button
                onClick={handleWipeConfirm}
                className="flex-1 py-2 rounded-xl text-sm font-semibold"
                style={{ background: '#ef4444', color: 'white' }}
              >
                Erase
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmingWipe(true)}
            className="text-xs"
            style={{ color: 'var(--text-3)' }}
          >
            I lost my access
          </button>
        )}
      </div>
    </div>
  )
}
