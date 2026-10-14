import { useState, type KeyboardEvent, type RefObject } from 'react'
import type { Message } from '@chat/contract'
import { useScrollToBottom } from '@/shared/hooks/useScrollToBottom'
import type { AiMode } from '@/features/ai/types/ai.types'
import { useAssistantChat } from './useAssistantChat'

type UseComposer = {
  conversationType: AiMode
  messages: Message[]
  streamingText: string | null
  toolLabel: string | null
  isStreaming: boolean
  error: string | null
  input: string
  canSend: boolean
  currentUserId: string
  endRef: RefObject<HTMLDivElement | null>
  onInputChange: (value: string) => void
  onInputKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  submit: () => void
}

export function useComposer(currentUserId: string, conversationType: AiMode): UseComposer {
  const { messages, streamingText, toolLabel, isStreaming, isReady, error, send } =
    useAssistantChat(currentUserId, conversationType)
  const [input, setInput] = useState('')
  const endRef = useScrollToBottom<HTMLDivElement>(messages.length > 0 || streamingText != null, [
    messages,
    streamingText,
  ])

  const canSend = isReady && !isStreaming && input.trim().length > 0

  function submit(): void {
    if (!canSend) {
      return
    }
    send(input.trim())
    setInput('')
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return {
    conversationType,
    messages,
    streamingText,
    toolLabel,
    isStreaming,
    error,
    input,
    canSend,
    currentUserId,
    endRef,
    onInputChange: setInput,
    onInputKeyDown,
    submit,
  }
}
