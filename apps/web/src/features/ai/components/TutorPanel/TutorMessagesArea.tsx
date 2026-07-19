import { useComposerContext } from '@/features/ai/context/composer.context'
import { EMPTY_STYLE, MESSAGES_STYLE } from './TutorPanel.constants'
import { TutorMessage } from './TutorMessage'
import { TutorStreamingBubble } from './TutorStreamingBubble'

export function TutorMessagesArea() {
  const { messages, streamingText, toolLabel, isStreaming, currentUserId, endRef } =
    useComposerContext()

  return (
    <div className={MESSAGES_STYLE}>
      {messages.length === 0 && streamingText === null && !isStreaming ? (
        <p className={EMPTY_STYLE}>Ask a question about your uploaded notes.</p>
      ) : null}

      {messages.map((message) => (
        <TutorMessage key={message.id} message={message} currentUserId={currentUserId} />
      ))}

      {isStreaming ? (
        <TutorStreamingBubble streamingText={streamingText} toolLabel={toolLabel} />
      ) : null}

      <div ref={endRef} />
    </div>
  )
}
