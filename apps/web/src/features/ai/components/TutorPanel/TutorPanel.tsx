import { KnowledgeDocumentsContainer } from '@/features/knowledge/components/KnowledgeDocuments/KnowledgeDocumentsContainer'
import { useComposerContext } from '@/features/ai/context/composer.context'
import {
  AVATAR_STYLE,
  ERROR_STYLE,
  HEADER_STYLE,
  HEADER_TITLE_STYLE,
  PANEL_STYLE,
} from './TutorPanel.styles'
import { TutorComposer } from './TutorComposer'
import { TutorMessagesArea } from './TutorMessagesArea'

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

      <TutorMessagesArea />

      <TutorComposer
        input={input}
        isStreaming={isStreaming}
        canSend={canSend}
        onInputChange={onInputChange}
        onSubmit={submit}
      />
    </section>
  )
}
