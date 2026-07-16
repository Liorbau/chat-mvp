import { useState, type CSSProperties } from 'react'
import type { UpdateProfileRequest } from '@chat/contract'
import { useAuth } from '../../auth/auth.context'
import { ApiRequestError } from '../api/apiClient'

type SaveSetters = {
  setSubmitting: (value: boolean) => void
  setErrors: (value: string[]) => void
  setSaved: (value: boolean) => void
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
  maxWidth: '460px',
  backgroundColor: '#ffffff',
  border: '1px solid #dbe3ee',
  borderRadius: '16px',
  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08)',
  padding: '24px',
}

const SECTION_STYLE: CSSProperties = {
  marginTop: '24px',
  paddingTop: '20px',
  borderTop: '1px solid #eef2f7',
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

const SECTION_HEADING_STYLE: CSSProperties = {
  margin: 0,
  fontSize: '16px',
  color: '#0f172a',
}

// Same shape as the signup error mapping so both flows read consistently.
function toProfileErrors(error: unknown): string[] {
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

function ErrorList({ messages }: { messages: string[] }) {
  if (messages.length === 0) {
    return null
  }
  return (
    <ul role="alert" style={{ color: '#b91c1c', marginTop: '12px', paddingLeft: '18px' }}>
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  )
}

function SavedNote({ show }: { show: boolean }) {
  if (!show) {
    return null
  }
  return <p style={{ color: '#15803d', marginTop: '12px', fontSize: '14px' }}>Saved.</p>
}

function submitButtonStyle(disabled: boolean): CSSProperties {
  return disabled ? { ...BUTTON_STYLE, ...BUTTON_DISABLED_STYLE } : BUTTON_STYLE
}

function ProfilePanel() {
  const { user, updateProfile } = useAuth()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [nameSubmitting, setNameSubmitting] = useState(false)
  const [nameErrors, setNameErrors] = useState<string[]>([])
  const [nameSaved, setNameSaved] = useState(false)

  const [email, setEmail] = useState(user?.email ?? '')
  const [emailSubmitting, setEmailSubmitting] = useState(false)
  const [emailErrors, setEmailErrors] = useState<string[]>([])
  const [emailSaved, setEmailSaved] = useState(false)

  if (user === null) {
    return null
  }

  async function runSave(payload: UpdateProfileRequest, setters: SaveSetters): Promise<void> {
    setters.setSubmitting(true)
    setters.setErrors([])
    setters.setSaved(false)

    try {
      await updateProfile(payload)
      setters.setSaved(true)
    } catch (error: unknown) {
      setters.setErrors(toProfileErrors(error))
    } finally {
      setters.setSubmitting(false)
    }
  }

  const nameChanged = firstName.trim() !== user.firstName || lastName.trim() !== user.lastName
  const emailChanged = email.trim().toLowerCase() !== user.email

  return (
    <main style={SCREEN_STYLE}>
      <section style={CARD_STYLE}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#2563eb' }}>Profile</h1>
        <p style={{ marginTop: '8px', color: '#334155' }}>Signed in as {user.name}.</p>

        <form
          style={SECTION_STYLE}
          onSubmit={(event) => {
            event.preventDefault()
            void runSave(
              { firstName, lastName },
              {
                setSubmitting: setNameSubmitting,
                setErrors: setNameErrors,
                setSaved: setNameSaved,
              },
            )
          }}
        >
          <h2 style={SECTION_HEADING_STYLE}>Name</h2>
          <label style={FIELD_STYLE}>
            <span>First name</span>
            <input
              type="text"
              required
              maxLength={100}
              value={firstName}
              autoComplete="given-name"
              onChange={(event) => {
                setFirstName(event.target.value)
                setNameSaved(false)
              }}
              style={INPUT_STYLE}
            />
          </label>
          <label style={FIELD_STYLE}>
            <span>Last name</span>
            <input
              type="text"
              required
              maxLength={100}
              value={lastName}
              autoComplete="family-name"
              onChange={(event) => {
                setLastName(event.target.value)
                setNameSaved(false)
              }}
              style={INPUT_STYLE}
            />
          </label>
          <ErrorList messages={nameErrors} />
          <SavedNote show={nameSaved} />
          <button
            type="submit"
            disabled={nameSubmitting || !nameChanged}
            style={submitButtonStyle(nameSubmitting || !nameChanged)}
          >
            {nameSubmitting ? 'Saving...' : 'Save name'}
          </button>
        </form>

        <form
          style={SECTION_STYLE}
          onSubmit={(event) => {
            event.preventDefault()
            void runSave(
              { email },
              {
                setSubmitting: setEmailSubmitting,
                setErrors: setEmailErrors,
                setSaved: setEmailSaved,
              },
            )
          }}
        >
          <h2 style={SECTION_HEADING_STYLE}>Email</h2>
          <label style={FIELD_STYLE}>
            <span>Email address</span>
            <input
              type="email"
              required
              value={email}
              autoComplete="email"
              onChange={(event) => {
                setEmail(event.target.value)
                setEmailSaved(false)
              }}
              style={INPUT_STYLE}
            />
          </label>
          <ErrorList messages={emailErrors} />
          <SavedNote show={emailSaved} />
          <button
            type="submit"
            disabled={emailSubmitting || !emailChanged}
            style={submitButtonStyle(emailSubmitting || !emailChanged)}
          >
            {emailSubmitting ? 'Saving...' : 'Save email'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default ProfilePanel
