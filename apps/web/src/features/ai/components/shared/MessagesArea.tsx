import { useComposerContext } from '@/features/ai/context/composer.context'
import { StreamingBubble } from './StreamingBubble'
import type { MessagesAreaProps } from './shared.types'

export function MessagesArea({
  emptyLabel,
  MessageComponent,
  styles,
  streamingBubbleStyles,
}: MessagesAreaProps) {
  const { messages, streamingText, toolLabel, isStreaming, currentUserId, endRef } =
    useComposerContext()

  return (
    <div className={styles.messages}>
      {messages.length === 0 && streamingText == null && !isStreaming ? (
        <p className={styles.empty}>{emptyLabel}</p>
      ) : null}

      {messages.map((message) => (
        <MessageComponent key={message.id} message={message} currentUserId={currentUserId} />
      ))}

      {isStreaming ? (
        <StreamingBubble
          streamingText={streamingText}
          toolLabel={toolLabel}
          styles={streamingBubbleStyles}
        />
      ) : null}

      <div ref={endRef} />
    </div>
  )
}
