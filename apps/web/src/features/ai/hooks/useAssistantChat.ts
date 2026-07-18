import { useCallback, useEffect, useReducer, useRef } from 'react'
import type { Message } from '@chat/contract'
import { createConversation, getMessages, streamAssistant } from '@/api'
import {
  assistantChatReducer,
  initialAssistantState,
} from '@/features/ai/state/assistantChatReducer'
import { handleAssistantEvent } from './handleAssistantEvent'

type AssistantChat = {
  messages: Message[]
  streamingText: string | null
  toolLabel: string | null
  isStreaming: boolean
  isReady: boolean
  error: string | null
  send: (content: string) => void
}

export function useAssistantChat(
  currentUserId: string,
  conversationType: 'assistant' | 'tutor' = 'assistant',
): AssistantChat {
  const [state, dispatch] = useReducer(assistantChatReducer, initialAssistantState)
  const abortRef = useRef<AbortController | null>(null)

  // Cancel any in-flight stream when the panel unmounts (mode switch / logout).
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

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
  }, [conversationType])

  const send = useCallback(
    (content: string) => {
      const conversationId = state.conversationId
      if (conversationId === null || state.isStreaming) {
        return
      }
      const tempId = `temp-${String(Date.now())}`
      dispatch({
        type: 'SEND_START',
        payload: {
          optimistic: {
            id: tempId,
            conversationId,
            senderId: currentUserId,
            content,
            createdAt: new Date().toISOString(),
          },
        },
      })

      const controller = new AbortController()
      abortRef.current = controller

      void streamAssistant(
        conversationId,
        content,
        (event) => {
          handleAssistantEvent(dispatch, event, tempId)
        },
        controller.signal,
      )
        .catch(() => {
          // Aborted streams belong to an unmounted panel; nothing to update.
          if (controller.signal.aborted) {
            return
          }
          dispatch({
            type: 'STREAM_ERROR',
            payload: { error: 'The assistant failed to respond.', tempId },
          })
        })
        .finally(() => {
          if (controller.signal.aborted) {
            return
          }
          dispatch({ type: 'STREAM_END' })
        })
    },
    [state.conversationId, state.isStreaming, currentUserId],
  )

  return {
    messages: state.messages,
    streamingText: state.streamingText,
    toolLabel: state.toolLabel,
    isStreaming: state.isStreaming,
    isReady: state.conversationId !== null,
    error: state.error,
    send,
  }
}
