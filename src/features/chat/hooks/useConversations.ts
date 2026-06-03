import { useCallback, useEffect, useState } from 'react'
import type { Conversation } from '../api/chatApi.types'
import type { LoadStatus } from '../state/chatStatus'
import { getConversations } from '../api/apiClient'

type UseConversationsResult = {
  status: LoadStatus
  conversations: Conversation[]
  error: string | null
  refetch: () => void
  markConversationActivity: (conversationId: string, lastMessagePreview?: string) => void
}

function sortByMostRecentActivity(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((firstConversation, secondConversation) => {
    return secondConversation.updatedAt.localeCompare(firstConversation.updatedAt)
  })
}

export function useConversations(): UseConversationsResult {
  const [status, setStatus] = useState<LoadStatus>('idle')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    setStatus('loading')
    setError(null)

    try {
      const data = await getConversations()
      setConversations(sortByMostRecentActivity(data))

      if (data.length === 0) {
        setStatus('empty')
      } else {
        setStatus('success')
      }
    } catch {
      setStatus('error')
      setError('Failed to load conversations')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadConversations()
  }, [loadConversations])

  function refetch() {
    void loadConversations()
  }

  const markConversationActivity = useCallback(
    (conversationId: string, lastMessagePreview?: string) => {
      setConversations((previousConversations) => {
        const activityTimestamp = new Date().toISOString()
        const updatedConversations = previousConversations.map((conversation) => {
          if (conversation.id !== conversationId) {
            return conversation
          }

          return {
            ...conversation,
            updatedAt: activityTimestamp,
            lastMessagePreview: lastMessagePreview ?? conversation.lastMessagePreview,
          }
        })

        return sortByMostRecentActivity(updatedConversations)
      })
    },
    [],
  )

  return {
    status,
    conversations,
    error,
    refetch,
    markConversationActivity,
  }
}
