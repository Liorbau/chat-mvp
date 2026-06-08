import { useEffect, useMemo, useReducer } from 'react'
import { initialMessagesState, messagesReducer } from '../state/messagesReducer'
import { useMessages } from './useMessages'
import {
  mergeOptimisticMessages,
  resolveOptimisticStatus,
  toPendingOptimisticMessages,
  toSentOptimisticMessages,
} from './optimisticMessages.selectors'
import { sendOptimisticMessage } from './optimisticMessages.send'
import type { UseOptimisticMessagesResult } from './optimisticMessages.types'

export function useOptimisticMessages(
  conversationId: string | null,
  currentUserId: string,
): UseOptimisticMessagesResult {
  const {
    status: baseStatus,
    messages: baseMessages,
    error: baseError,
    refetch,
  } = useMessages(conversationId)

  const [state, dispatch] = useReducer(messagesReducer, initialMessagesState)

  useEffect(() => {
    dispatch({ type: 'RESET' })
  }, [conversationId])

  useEffect(() => {
    dispatch({
      type: 'LOAD_SUCCESS',
      payload: { messages: baseMessages },
    })
  }, [baseMessages])

  const optimisticBaseMessages = useMemo(() => {
    return toSentOptimisticMessages(state.messages)
  }, [state.messages])

  const optimisticPendingMessages = useMemo(() => {
    return toPendingOptimisticMessages(state.pendingMessages)
  }, [state.pendingMessages])

  const mergedMessages = useMemo(() => {
    return mergeOptimisticMessages(optimisticBaseMessages, optimisticPendingMessages)
  }, [optimisticBaseMessages, optimisticPendingMessages])

  const status = resolveOptimisticStatus(conversationId, baseStatus, mergedMessages)

  async function sendMessage(content: string): Promise<void> {
    return sendOptimisticMessage({ conversationId, currentUserId, content, dispatch })
  }

  return {
    status,
    messages: mergedMessages,
    error: state.error ?? baseError,
    sendMessage,
    refetch,
  }
}
