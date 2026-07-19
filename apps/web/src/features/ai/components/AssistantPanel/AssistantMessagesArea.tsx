import { useComposerContext } from '@/features/ai/context/composer.context'
import { EMPTY_STYLE, MESSAGES_STYLE } from './AssistantPanel.constants'
import { AssistantMessage } from './AssistantMessage'
import { AssistantStreamingBubble } from './AssistantStreamingBubble'

export function AssistantMessagesArea() {
  const { messages, streamingText, toolLabel, isStreaming, currentUserId, endRef } =
    useComposerContext()

  return (
    <div className={MESSAGES_STYLE}>
      {messages.length === 0 && streamingText === null && !isStreaming ? (
        <p className={EMPTY_STYLE}>Ask me anything about your chats.</p>
      ) : null}

      {messages.map((message) => (
        <AssistantMessage key={message.id} message={message} currentUserId={currentUserId} />
      ))}

      {isStreaming ? (
        <AssistantStreamingBubble streamingText={streamingText} toolLabel={toolLabel} />
      ) : null}

      <div ref={endRef} />
    </div>
  )
}
