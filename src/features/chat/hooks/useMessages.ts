import { useCallback, useEffect, useRef, useState } from 'react'
import type { Message } from '../api/chatApi.types'
import { getMessages } from '../api/apiClient'
import type { LoadStatus } from '../state/chatStatus'

type UseMessagesResult = {
  status: LoadStatus
  messages: Message[]
  error: string | null
  refetch: () => void
}

export function useMessages(conversationId: string | null): UseMessagesResult {
  const [status, setStatus] = useState<LoadStatus>('idle')
  const [messages, setMessages] = useState<Message[]>([])
  const [error, setError] = useState<string | null>(null)
  const activeConversationIdRef = useRef<string | null>(conversationId)

  useEffect(() => {
    activeConversationIdRef.current = conversationId
  }, [conversationId])

  const loadMessages = useCallback(async () => {
    const requestedConversationId = conversationId

    if (requestedConversationId === null) {
      setStatus('idle')
      setMessages([])
      setError(null)
      return
    }

    setStatus('loading')
    setError(null)
    setMessages([])

    try {
      let cursor: string | undefined = undefined
      let nextMessages: Message[] = []
      let safetyCounter = 0

      while (true) {
        const response = await getMessages(requestedConversationId, cursor)
        // Bail out if the user switched conversations mid-flight; otherwise a
        // stale response would overwrite the newly selected conversation.
        if (activeConversationIdRef.current !== requestedConversationId) {
          return
        }
        nextMessages = [...response.messages, ...nextMessages]

        if (response.nextCursor === null) {
          break
        }

        cursor = response.nextCursor
        safetyCounter += 1
        if (safetyCounter > 100) {
          throw new Error('Failed to load full message history')
        }
      }

      setMessages(nextMessages)
      setStatus(nextMessages.length === 0 ? 'empty' : 'success')
    } catch {
      if (activeConversationIdRef.current !== requestedConversationId) {
        return
      }
      setStatus('error')
      setError('Failed to load messages')
    }
  }, [conversationId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMessages()
  }, [loadMessages])

  function refetch() {
    void loadMessages()
  }

  return {
    status,
    messages,
    error,
    refetch,
  }
}
