import { KnowledgeDocumentsContainer } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocumentsContainer'
import {
  AVATAR_STYLE,
  EMPTY_STYLE,
  ERROR_STYLE,
  HEADER_STYLE,
  HEADER_TITLE_STYLE,
  MESSAGES_STYLE,
  PANEL_STYLE,
} from './TutorPanel.constants'
import { TutorComposer } from './TutorComposer'
import { TutorMessage } from './TutorMessage'
import { TutorStreamingBubble } from './TutorStreamingBubble'
import type { TutorPanelViewProps } from './TutorPanel.types'

export function TutorPanel({
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
}: TutorPanelViewProps) {
  return (
    <section className={PANEL_STYLE}>
      <header className={HEADER_STYLE}>
        <div className={AVATAR_STYLE}>📖</div>
        <strong className={HEADER_TITLE_STYLE}>Tutor</strong>
      </header>

      <KnowledgeDocumentsContainer />

      {error !== null ? (
        <div className={ERROR_STYLE} role="alert">
          {error}
        </div>
      ) : null}

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

      <TutorComposer
        input={input}
        isStreaming={isStreaming}
        canSend={canSend}
        onInputChange={onInputChange}
        onSubmit={onSubmit}
      />
    </section>
  )
}
