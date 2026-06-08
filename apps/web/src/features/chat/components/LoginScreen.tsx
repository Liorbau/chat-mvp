import { useState } from 'react'
import { login } from '../api/apiClient'
import type { User } from '../api/chatApi.types'

type LoginScreenProps = {
  onLogin: (user: User) => void
}

const LOGIN_OPTIONS = [
  { id: 'user-1', label: 'Alex (user-1)' },
  { id: 'user-2', label: 'Sam (user-2)' },
  { id: 'user-3', label: 'Dana (user-3)' },
  { id: 'user-4', label: 'Maya (user-4)' },
] as const

const SCREEN_STYLE = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8fafc',
  padding: '32px 24px',
}

const CARD_STYLE = {
  width: '100%',
  maxWidth: '420px',
  backgroundColor: '#ffffff',
  border: '1px solid #dbe3ee',
  borderRadius: '16px',
  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08)',
  padding: '24px',
}

const OPTIONS_STYLE = {
  display: 'grid',
  gap: '10px',
  marginTop: '14px',
}

const OPTION_LABEL_STYLE = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  border: '1px solid #dbe3ee',
  borderRadius: '10px',
  backgroundColor: '#f8fafc',
  padding: '10px 12px',
}

const LOGIN_BUTTON_STYLE = {
  marginTop: '16px',
  width: '100%',
  height: '42px',
  borderRadius: '10px',
  border: 'none',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
}

const LOGIN_BUTTON_DISABLED_STYLE = {
  opacity: 0.6,
  cursor: 'not-allowed',
}

function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>(LOGIN_OPTIONS[0].id)
  const [isLoading, setIsLoading] = useState(false)
  const [isErrorVisible, setIsErrorVisible] = useState(false)

  async function handleLogin(): Promise<void> {
    setIsLoading(true)
    setIsErrorVisible(false)

    try {
      const response = await login({ userId: selectedUserId })
      onLogin(response.user)
    } catch {
      setIsErrorVisible(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main style={SCREEN_STYLE}>
      <section style={CARD_STYLE}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#2563eb' }}>Chat Login</h1>
        <p style={{ marginTop: '8px', color: '#334155' }}>Choose a user identity to continue.</p>

        <div style={OPTIONS_STYLE}>
          {LOGIN_OPTIONS.map((option) => {
            const isSelected = selectedUserId === option.id
            const optionLabelStyle = isSelected
              ? {
                  ...OPTION_LABEL_STYLE,
                  border: '1px solid #93c5fd',
                  backgroundColor: '#eaf2ff',
                }
              : OPTION_LABEL_STYLE

            return (
              <label key={option.id} style={optionLabelStyle}>
                <input
                  type="radio"
                  name="mock-user"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => {
                    setSelectedUserId(option.id)
                  }}
                />
                <span>{option.label}</span>
              </label>
            )
          })}
        </div>

        {isErrorVisible ? (
          <p role="alert" style={{ color: '#b91c1c', marginTop: '10px' }}>
            Invalid credentials
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => {
            void handleLogin()
          }}
          disabled={isLoading}
          style={
            isLoading
              ? { ...LOGIN_BUTTON_STYLE, ...LOGIN_BUTTON_DISABLED_STYLE }
              : LOGIN_BUTTON_STYLE
          }
        >
          {isLoading ? 'Logging in...' : 'Log in'}
        </button>
      </section>
    </main>
  )
}

export default LoginScreen
