import { useCallback, useEffect, useReducer, useRef } from 'react'
import { ASSISTANT_SENDER_ID } from '@chat/contract'
import type { Message } from '@chat/contract'
import { createConversation, getMessages, streamAssistant } from '@/api'
import {
  assistantChatReducer,
  initialAssistantState,
} from '@/features/ai/state/assistantChatReducer'

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
          if (event.type === 'user_message') {
            dispatch({ type: 'USER_MESSAGE', payload: { tempId, message: event.message } })
          } else if (event.type === 'tool_call') {
            // tool_result needs no UI change; the label persists until tokens start.
            dispatch({ type: 'TOOL_CALL', payload: { label: event.label } })
          } else if (event.type === 'token') {
            dispatch({ type: 'TOKEN', payload: { value: event.value } })
          } else if (event.type === 'done') {
            dispatch({
              type: 'DONE',
              payload: {
                messageId: event.messageId,
                senderId: ASSISTANT_SENDER_ID,
                createdAt: new Date().toISOString(),
                citations: event.citations,
              },
            })
          } else if (event.type === 'error') {
            dispatch({ type: 'STREAM_ERROR', payload: { error: event.message, tempId } })
          }
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
