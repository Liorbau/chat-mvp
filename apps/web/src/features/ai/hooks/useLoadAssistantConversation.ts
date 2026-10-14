import { useEffect, type Dispatch } from 'react'
import { createConversation, getMessages } from '@/api'
import type { AssistantAction } from '@/features/ai/state/assistantChatReducer'
import type { AiMode } from '@/features/ai/types/ai.types'

export function useLoadAssistantConversation(
  conversationType: AiMode,
  dispatch: Dispatch<AssistantAction>,
): void {
  useEffect(() => {
    let active = true
    void createConversation({ type: conversationType })
      .then(async (conversation) => {
        const page = await getMessages(conversation.id)
        if (active) {
          dispatch({
            type: 'READY',
            payload: { conversationId: conversation.id, messages: page.messages },
          })
        }
      })
      .catch(() => {
        if (active) {
          dispatch({
            type: 'LOAD_ERROR',
            payload: { error: 'Could not open the assistant. Please try again.' },
          })
        }
      })
    return () => {
      active = false
    }
  }, [conversationType, dispatch])
}
