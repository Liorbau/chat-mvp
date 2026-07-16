import {
  AVATAR_STYLE,
  EMPTY_STYLE,
  ERROR_STYLE,
  HEADER_STYLE,
  HEADER_TITLE_STYLE,
  MESSAGES_STYLE,
  PANEL_STYLE,
} from './AssistantPanel.constants'
import { AssistantComposer } from './AssistantComposer'
import { AssistantMessage } from './AssistantMessage'
import { AssistantStreamingBubble } from './AssistantStreamingBubble'
import type { AssistantPanelViewProps } from './AssistantPanel.types'

export function AssistantPanel({
  messages,
  streamingText,
  toolLabel,
  isStreaming,
  error,
  input,
  canSend,
  currentUserId,
  endRef,
  onInputChange,
  onSubmit,
}: AssistantPanelViewProps) {
  return (
    <section className={PANEL_STYLE}>
      <header className={HEADER_STYLE}>
        <div className={AVATAR_STYLE}>✦</div>
        <strong className={HEADER_TITLE_STYLE}>Assistant</strong>
      </header>

      {error !== null ? (
        <div className={ERROR_STYLE} role="alert">
          {error}
        </div>
      ) : null}

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

      <AssistantComposer
        input={input}
        isStreaming={isStreaming}
        canSend={canSend}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
      />
    </section>
  )
}
