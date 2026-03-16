import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

// ── localStorage keys ─────────────────────────────────────────

const ENABLED_KEY = 'streak_biometric_enabled'
const CREDENTIAL_KEY = 'streak_biometric_credential_id'

// ── Helpers ───────────────────────────────────────────────────

function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

// ── Context shape ─────────────────────────────────────────────

interface BiometricAuthContextValue {
  isSupported: boolean
  isEnabled: boolean
  isUnlocked: boolean
  needsReenrollment: boolean
  authError: string | null
  unlock: () => Promise<void>
  enrollBiometric: () => Promise<void>
  disableBiometric: () => Promise<void>
  resetBiometric: () => void
}

const BiometricAuthContext = createContext<BiometricAuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────

export function BiometricAuthProvider({ children }: { children: ReactNode }) {
  const [isSupported] = useState(isWebAuthnSupported)
  const [isEnabled, setIsEnabled] = useState(
    () => localStorage.getItem(ENABLED_KEY) === 'true',
  )
  // Start locked if enabled; start unlocked if not enabled
  const [isUnlocked, setIsUnlocked] = useState(
    () => localStorage.getItem(ENABLED_KEY) !== 'true',
  )
  // Needs re-enrollment if enabled but no credential stored
  const [needsReenrollment, setNeedsReenrollment] = useState(
    () =>
      localStorage.getItem(ENABLED_KEY) === 'true' &&
      !localStorage.getItem(CREDENTIAL_KEY),
  )
  const [authError, setAuthError] = useState<string | null>(null)

  // Re-lock on visibility change (tab switch / app background)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        setIsUnlocked(false)
        setAuthError(null)
      }
    }
    // Also handle window focus as a fallback for environments where
    // visibilitychange is delayed or suppressed
    function handleFocus() {
      if (localStorage.getItem(ENABLED_KEY) === 'true') {
        setIsUnlocked(false)
        setAuthError(null)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // ── unlock ────────────────────────────────────────────────

  const unlock = useCallback(async () => {
    setAuthError(null)
    const credentialIdStr = localStorage.getItem(CREDENTIAL_KEY)
    if (!credentialIdStr) {
      setNeedsReenrollment(true)
      return
    }
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const credentialId = base64ToArrayBuffer(credentialIdStr)
      await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ id: credentialId, type: 'public-key' }],
          userVerification: 'required',
          timeout: 60000,
        },
      })
      setIsUnlocked(true)
      setNeedsReenrollment(false)
    } catch (err) {
      const error = err as DOMException
      // Heuristic: if error message mentions "credential", likely invalid/missing
      if (
        error.name === 'NotAllowedError' &&
        error.message?.toLowerCase().includes('credential')
      ) {
        setNeedsReenrollment(true)
      } else if (error.name !== 'NotAllowedError') {
        // Unexpected error (not a simple user cancel)
        setNeedsReenrollment(true)
      } else {
        setAuthError('Authentication failed. Try again.')
      }
    }
  }, [])

  // ── enrollBiometric ───────────────────────────────────────

  const enrollBiometric = useCallback(async () => {
    setAuthError(null)
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const userId = crypto.getRandomValues(new Uint8Array(16))
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'Streak Keep', id: window.location.hostname },
        user: { id: userId, name: 'user', displayName: 'User' },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },   // ES256
          { type: 'public-key', alg: -257 },  // RS256
        ],
        authenticatorSelection: { userVerification: 'required' },
        timeout: 60000,
      },
    })) as PublicKeyCredential | null
    if (!credential) throw new Error('No credential returned')
    const credentialIdStr = arrayBufferToBase64(credential.rawId)
    localStorage.setItem(CREDENTIAL_KEY, credentialIdStr)
    localStorage.setItem(ENABLED_KEY, 'true')
    setIsEnabled(true)
    setIsUnlocked(true)
    setNeedsReenrollment(false)
  }, [])

  // ── disableBiometric ──────────────────────────────────────

  const disableBiometric = useCallback(async () => {
    setAuthError(null)
    const credentialIdStr = localStorage.getItem(CREDENTIAL_KEY)
    if (!credentialIdStr) {
      // No credential to verify against — clear anyway
      localStorage.removeItem(ENABLED_KEY)
      localStorage.removeItem(CREDENTIAL_KEY)
      setIsEnabled(false)
      setIsUnlocked(true)
      return
    }
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const credentialId = base64ToArrayBuffer(credentialIdStr)
      await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ id: credentialId, type: 'public-key' }],
          userVerification: 'required',
          timeout: 60000,
        },
      })
      localStorage.removeItem(ENABLED_KEY)
      localStorage.removeItem(CREDENTIAL_KEY)
      setIsEnabled(false)
      setIsUnlocked(true)
      setNeedsReenrollment(false)
    } catch (err) {
      const error = err as DOMException
      if (error.name !== 'NotAllowedError') {
        setAuthError('Authentication failed. Try again.')
      }
      throw err // re-throw so caller knows it was cancelled/failed
    }
  }, [])

  // ── resetBiometric ────────────────────────────────────────

  const resetBiometric = useCallback(() => {
    localStorage.removeItem(ENABLED_KEY)
    localStorage.removeItem(CREDENTIAL_KEY)
    setIsEnabled(false)
    setIsUnlocked(true)
    setNeedsReenrollment(false)
    setAuthError(null)
  }, [])

  return (
    <BiometricAuthContext.Provider
      value={{
        isSupported,
        isEnabled,
        isUnlocked,
        needsReenrollment,
        authError,
        unlock,
        enrollBiometric,
        disableBiometric,
        resetBiometric,
      }}
    >
      {children}
    </BiometricAuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────

export function useBiometricAuth(): BiometricAuthContextValue {
  const ctx = useContext(BiometricAuthContext)
  if (!ctx) throw new Error('useBiometricAuth must be used within BiometricAuthProvider')
  return ctx
}
