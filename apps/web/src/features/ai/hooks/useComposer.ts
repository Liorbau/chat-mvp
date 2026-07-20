import { useState } from 'react'
import { useScrollToBottom } from '@/shared/hooks/useScrollToBottom'
import type { ComposerValue } from '@/features/ai/context/composer.types'
import { useAssistantChat } from './useAssistantChat'

// Shared composer state for the assistant and tutor panels: streams a reply,
// tracks the input, auto-scrolls, and gates sending. `conversationType` is the
// only difference between the two panels.
export function useComposer(
  currentUserId: string,
  conversationType: 'assistant' | 'tutor',
): ComposerValue {
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

  return {
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
    submit,
  }
}
