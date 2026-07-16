import { useState } from 'react'
import { ApiRequestError, createConversation } from '@/api'
import { useUsers } from '@/features/user/context/user.context'
import { NewConversation } from './NewConversation'
import type { NewConversationProps } from './NewConversation.types'

export function NewConversationContainer({ currentUserId, onCreated }: NewConversationProps) {
  const { users } = useUsers()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const others = users
    .filter((candidate) => candidate.id !== currentUserId)
    .sort((left, right) => left.name.localeCompare(right.name))

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

  return (
    <NewConversation
      isOpen={isOpen}
      others={others}
      selectedUserId={selectedUserId}
      errorMessage={errorMessage}
      isBusy={isBusy}
      onOpen={open}
      onSelect={setSelectedUserId}
      onCreate={() => {
        void create()
      }}
      onCancel={() => {
        setIsOpen(false)
      }}
    />
  )
}
