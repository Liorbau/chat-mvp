import { useState, type CSSProperties, type FormEvent } from 'react'
import { useAuth } from '../../auth/auth-context'
import { ApiRequestError } from '../api/apiClient'

type SignupScreenProps = {
  onSwitchToLogin: () => void
}

const SCREEN_STYLE: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f8fafc',
  padding: '32px 24px',
}

const CARD_STYLE: CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  backgroundColor: '#ffffff',
  border: '1px solid #dbe3ee',
  borderRadius: '16px',
  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08)',
  padding: '24px',
}

const FIELD_STYLE: CSSProperties = {
  display: 'grid',
  gap: '6px',
  marginTop: '14px',
}

const INPUT_STYLE: CSSProperties = {
  height: '40px',
  borderRadius: '10px',
  border: '1px solid #2563eb',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  padding: '0 12px',
  fontSize: '15px',
}

const BUTTON_STYLE: CSSProperties = {
  marginTop: '18px',
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

const BUTTON_DISABLED_STYLE: CSSProperties = {
  opacity: 0.6,
  cursor: 'not-allowed',
}

const SWITCH_BUTTON_STYLE: CSSProperties = {
  marginTop: '14px',
  width: '100%',
  background: 'none',
  border: 'none',
  color: '#2563eb',
  fontSize: '14px',
  cursor: 'pointer',
}

function toSignupErrors(error: unknown): string[] {
  if (error instanceof ApiRequestError) {
    if (error.status === 409) {
      return ['An account with this email already exists.']
    }
    if (error.status === 400 && Array.isArray(error.details)) {
      const messages = error.details.filter(
        (detail): detail is string => typeof detail === 'string',
      )
      if (messages.length > 0) {
        return messages
      }
    }
    return [error.message]
  }
  if (error instanceof Error) {
    return [error.message]
  }

  return ['Something went wrong. Please try again.']
}

function SignupScreen({ onSwitchToLogin }: SignupScreenProps) {
  const { signUp } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessages, setErrorMessages] = useState<string[]>([])

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessages([])

    try {
      await signUp({ name, email, password })
    } catch (error: unknown) {
      setErrorMessages(toSignupErrors(error))
      setIsSubmitting(false)
    }
  }

  return (
    <main style={SCREEN_STYLE}>
      <section style={CARD_STYLE}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#2563eb' }}>Create account</h1>
        <p style={{ marginTop: '8px', color: '#334155' }}>Join the chat in a few seconds.</p>

        <form
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
        >
          <label style={FIELD_STYLE}>
            <span>Name</span>
            <input
              type="text"
              required
              maxLength={100}
              value={name}
              autoComplete="name"
              onChange={(event) => {
                setName(event.target.value)
              }}
              style={INPUT_STYLE}
            />
          </label>

          <label style={FIELD_STYLE}>
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              autoComplete="email"
              onChange={(event) => {
                setEmail(event.target.value)
              }}
              style={INPUT_STYLE}
            />
          </label>

          <label style={FIELD_STYLE}>
            <span>Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              autoComplete="new-password"
              onChange={(event) => {
                setPassword(event.target.value)
              }}
              style={INPUT_STYLE}
            />
          </label>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>
            At least 8 characters.
          </span>

          {errorMessages.length > 0 ? (
            <ul role="alert" style={{ color: '#b91c1c', marginTop: '12px', paddingLeft: '18px' }}>
              {errorMessages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            style={isSubmitting ? { ...BUTTON_STYLE, ...BUTTON_DISABLED_STYLE } : BUTTON_STYLE}
          >
            {isSubmitting ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <button type="button" onClick={onSwitchToLogin} style={SWITCH_BUTTON_STYLE}>
          Already have an account? Log in
        </button>
      </section>
    </main>
  )
}

export default SignupScreen
