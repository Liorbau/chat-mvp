import { useState, type CSSProperties } from 'react'
import type { User } from '../api/chatApi.types'
import { ApiRequestError, createConversation } from '../api/apiClient'

type NewConversationProps = {
  currentUserId: string
  users: User[]
  onCreated: (conversationId: string) => void
}

const NEW_BUTTON_STYLE: CSSProperties = {
  width: '100%',
  height: '38px',
  borderRadius: '10px',
  border: '1px solid #2563eb',
  backgroundColor: '#ffffff',
  color: '#2563eb',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
}

const FORM_STYLE: CSSProperties = {
  border: '1px solid #dbe3ee',
  borderRadius: '10px',
  padding: '10px',
}

const SELECT_STYLE: CSSProperties = {
  width: '100%',
  height: '36px',
  borderRadius: '8px',
  border: '1px solid #2563eb',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  padding: '0 8px',
}

const ACTION_BUTTON_STYLE: CSSProperties = {
  flex: 1,
  height: '34px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  cursor: 'pointer',
}

const PRIMARY_BUTTON_STYLE: CSSProperties = {
  ...ACTION_BUTTON_STYLE,
  border: 'none',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  fontWeight: 600,
}

function NewConversation({ currentUserId, users, onCreated }: NewConversationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const others = users.filter((candidate) => candidate.id !== currentUserId)

  function open(): void {
    setIsOpen(true)
    setErrorMessage(null)
    setIsBusy(false)
    setSelectedUserId(others[0]?.id ?? '')
  }

  async function create(): Promise<void> {
    if (selectedUserId === '') {
      return
    }
    setIsBusy(true)
    setErrorMessage(null)

    try {
      // No title: a direct chat's name is derived per-viewer from participants.
      const conversation = await createConversation({ participantIds: [selectedUserId] })
      setIsBusy(false)
      setIsOpen(false)
      onCreated(conversation.id)
    } catch (error: unknown) {
      if (error instanceof ApiRequestError && error.status === 409) {
        setErrorMessage('You already have a conversation with this person.')
      } else {
        setErrorMessage('Could not create the conversation.')
      }
      setIsBusy(false)
    }
  }

  if (!isOpen) {
    return (
      <button type="button" style={NEW_BUTTON_STYLE} onClick={open}>
        + New conversation
      </button>
    )
  }

  return (
    <div style={FORM_STYLE}>
      <select
        value={selectedUserId}
        onChange={(event) => {
          setSelectedUserId(event.target.value)
        }}
        style={SELECT_STYLE}
      >
        {others.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {candidate.name}
          </option>
        ))}
      </select>

      {errorMessage !== null ? (
        <p role="alert" style={{ color: '#b91c1c', margin: '8px 0 0' }}>
          {errorMessage}
        </p>
      ) : null}

      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
        <button
          type="button"
          style={PRIMARY_BUTTON_STYLE}
          disabled={isBusy || selectedUserId === ''}
          onClick={() => {
            void create()
          }}
        >
          {isBusy ? 'Creating...' : 'Create'}
        </button>
        <button
          type="button"
          style={ACTION_BUTTON_STYLE}
          onClick={() => {
            setIsOpen(false)
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default NewConversation
