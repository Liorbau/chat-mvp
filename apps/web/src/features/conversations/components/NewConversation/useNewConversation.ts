import { useState } from 'react'
import { ApiRequestError, createConversation } from '@/api'
import { useUsers } from '@/features/user/context/user.context'
import type { NewConversationValue } from './NewConversation.types'

export function useNewConversation(
  currentUserId: string,
  onCreated: (conversationId: string) => void,
): NewConversationValue {
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

  function create(): void {
    if (selectedUserId === '') {
      return
    }
    setIsBusy(true)
    setErrorMessage(null)
    // No title: a direct chat's name is derived per-viewer from participants.
    void createConversation({ participantIds: [selectedUserId] })
      .then((conversation) => {
        setIsBusy(false)
        setIsOpen(false)
        onCreated(conversation.id)
      })
      .catch((error: unknown) => {
        if (error instanceof ApiRequestError && error.status === 409) {
          setErrorMessage('You already have a conversation with this person.')
        } else {
          setErrorMessage('Could not create the conversation.')
        }
        setIsBusy(false)
      })
  }

  function cancel(): void {
    setIsOpen(false)
  }

  return {
    isOpen,
    others,
    selectedUserId,
    errorMessage,
    isBusy,
    open,
    onSelect: setSelectedUserId,
    create,
    cancel,
  }
}
