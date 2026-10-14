import { useComposerContext } from '@/features/ai/context/composer.context'
import { MESSAGES_STYLE } from './MessagesArea.styles'
import { ChatMessage } from './components/ChatMessage/ChatMessage'
import { EmptyState } from './components/EmptyState/EmptyState'
import { StreamingBubble } from './components/StreamingBubble/StreamingBubble'

export function MessagesArea() {
  const { messages, endRef } = useComposerContext()

  return (
    <div className={MESSAGES_STYLE}>
      <EmptyState />
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      <StreamingBubble />
      <div ref={endRef} />
    </div>
  )
}
