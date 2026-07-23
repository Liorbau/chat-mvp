import { KnowledgeDocumentsContainer } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocumentsContainer'
import { useComposerContext } from '@/features/ai/context/composer.context'
import { Composer } from '@/features/ai/components/shared/Composer/Composer'
import { MessagesArea } from '@/features/ai/components/shared/MessagesArea/MessagesArea'
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
} from './TutorPanel.styles'
import { TutorMessage } from './components/TutorMessage/TutorMessage'

export function TutorPanel() {
  const { error, input, isStreaming, canSend, onInputChange, submit } = useComposerContext()

  return (
    <section className={PANEL_STYLE}>
      <header className={HEADER_STYLE}>
        <div className={AVATAR_STYLE}>📖</div>
        <strong className={HEADER_TITLE_STYLE}>Tutor</strong>
      </header>

      <KnowledgeDocumentsContainer />

      {error != null ? (
        <div className={ERROR_STYLE} role="alert">
          {error}
        </div>
      ) : null}

      <MessagesArea
        emptyLabel="Ask a question about your uploaded notes."
        MessageComponent={TutorMessage}
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
        placeholderIdle="Ask about your notes…"
        placeholderStreaming="Waiting for the tutor…"
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
