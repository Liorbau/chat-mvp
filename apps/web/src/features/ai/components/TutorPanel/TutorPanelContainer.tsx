import { useState } from 'react'
import { useScrollToBottom } from '@/shared/hooks/useScrollToBottom'
import { useAssistantChat } from '@/features/ai/hooks/useAssistantChat'
import { TutorPanel } from './TutorPanel'
import type { TutorPanelProps } from './TutorPanel.types'

export function TutorPanelContainer({ currentUserId }: TutorPanelProps) {
  const { messages, streamingText, toolLabel, isStreaming, isReady, error, send } =
    useAssistantChat(currentUserId, 'tutor')
  const [input, setInput] = useState('')
  const endRef = useScrollToBottom<HTMLDivElement>(messages.length > 0 || streamingText !== null, [
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

  return (
    <TutorPanel
      messages={messages}
      streamingText={streamingText}
      toolLabel={toolLabel}
      isStreaming={isStreaming}
      error={error}
      input={input}
      canSend={canSend}
      currentUserId={currentUserId}
      endRef={endRef}
      onInputChange={setInput}
      onSubmit={submit}
    />
  )
}
