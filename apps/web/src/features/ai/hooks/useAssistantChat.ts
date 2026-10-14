import { useEffect, useReducer, useRef } from 'react'
import type { Message } from '@chat/contract'
import {
  assistantChatReducer,
  initialAssistantState,
} from '@/features/ai/state/assistantChatReducer'
import { useLoadAssistantConversation } from './useLoadAssistantConversation'
import { useSendAssistantMessage } from './useSendAssistantMessage'
import type { AiMode } from '@/features/ai/types/ai.types'

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
  conversationType: AiMode = 'assistant',
): AssistantChat {
  const [state, dispatch] = useReducer(assistantChatReducer, initialAssistantState)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const streamAbort = abortRef
    return () => {
      streamAbort.current?.abort()
    }
  }, [])

  useLoadAssistantConversation(conversationType, dispatch)
  const send = useSendAssistantMessage(state, dispatch, currentUserId, abortRef)

  return {
    messages: state.messages,
    streamingText: state.streamingText,
    toolLabel: state.toolLabel,
    isStreaming: state.isStreaming,
    isReady: state.conversationId != null,
    error: state.error,
    send,
  }
}
