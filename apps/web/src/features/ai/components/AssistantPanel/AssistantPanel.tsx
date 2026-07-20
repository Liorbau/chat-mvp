import { useComposerContext } from '@/features/ai/context/composer.context'
import {
  AVATAR_STYLE,
  ERROR_STYLE,
  HEADER_STYLE,
  HEADER_TITLE_STYLE,
  PANEL_STYLE,
} from './AssistantPanel.styles'
import { AssistantComposer } from './AssistantComposer'
import { AssistantMessagesArea } from './AssistantMessagesArea'

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

      <AssistantMessagesArea />

      <AssistantComposer
        input={input}
        isStreaming={isStreaming}
        canSend={canSend}
        onInputChange={onInputChange}
        onSubmit={submit}
      />
    </section>
  )
}
