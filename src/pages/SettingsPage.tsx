import { useState } from 'react'
import { useBiometricAuth } from '../context/BiometricAuthContext'

export default function SettingsPage() {
  const { isSupported, isEnabled, enrollBiometric, disableBiometric } = useBiometricAuth()
  const [pending, setPending] = useState(false)

  async function handleToggle() {
    if (pending) return
    setPending(true)
    try {
      if (isEnabled) {
        await disableBiometric()
      } else {
        await enrollBiometric()
      }
    } catch {
      // User cancelled or auth failed — state already managed by context
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Security section */}
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--text-3)' }}>
          Security
        </p>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Biometric Lock</span>
              {!isSupported ? (
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                  Not supported on this device
                </span>
              ) : (
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                  {isEnabled
                    ? 'Require biometrics to open the app'
                    : 'Protect your data with Face ID or fingerprint'}
                </span>
              )}
            </div>
            {/* Toggle */}
            <button
              role="switch"
              aria-checked={isEnabled}
              aria-label="Biometric Lock"
              disabled={!isSupported || pending}
              onClick={handleToggle}
              className="relative shrink-0 w-12 h-7 rounded-full transition-colors duration-200 disabled:opacity-40"
              style={{
                background: isEnabled ? '#22c55e' : 'var(--border-2)',
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: isEnabled ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
