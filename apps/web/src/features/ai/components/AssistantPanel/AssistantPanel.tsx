import { useComposerContext } from '@/features/ai/context/composer.context'
import { Composer } from '@/features/ai/components/shared/Composer'
import { MessagesArea } from '@/features/ai/components/shared/MessagesArea'
import {
  AVATAR_STYLE,
  COMPOSER_STYLE,
  EMPTY_STYLE,
  ERROR_STYLE,
  HEADER_STYLE,
  HEADER_TITLE_STYLE,
  MESSAGES_STYLE,
  PANEL_STYLE,
  SEND_DISABLED_STYLE,
  SEND_STYLE,
  STATUS_STYLE,
  STREAMING_BUBBLE_STYLE,
  STREAMING_ROW_STYLE,
  TEXTAREA_STYLE,
} from './AssistantPanel.styles'
import { AssistantMessage } from './AssistantMessage'

export function AssistantPanel() {
  const { error, input, isStreaming, canSend, onInputChange, submit } = useComposerContext()

  return (
    <section className={PANEL_STYLE}>
      <header className={HEADER_STYLE}>
        <div className={AVATAR_STYLE}>✦</div>
        <strong className={HEADER_TITLE_STYLE}>Assistant</strong>
      </header>

      {error != null ? (
        <div className={ERROR_STYLE} role="alert">
          {error}
        </div>
      ) : null}

      <MessagesArea
        emptyLabel="Ask me anything about your chats."
        MessageComponent={AssistantMessage}
        styles={{ messages: MESSAGES_STYLE, empty: EMPTY_STYLE }}
        streamingBubbleStyles={{
          row: STREAMING_ROW_STYLE,
          bubble: STREAMING_BUBBLE_STYLE,
          status: STATUS_STYLE,
        }}
      />

      <Composer
        input={input}
        isStreaming={isStreaming}
        canSend={canSend}
        placeholderIdle="Message the assistant…"
        placeholderStreaming="Waiting for the assistant…"
        styles={{
          composer: COMPOSER_STYLE,
          textarea: TEXTAREA_STYLE,
          send: SEND_STYLE,
          sendDisabled: SEND_DISABLED_STYLE,
        }}
        onInputChange={onInputChange}
        onSubmit={submit}
      />
    </section>
  )
}
