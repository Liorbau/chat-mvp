import {
  COMPOSER_STYLE,
  SEND_DISABLED_STYLE,
  SEND_STYLE,
  TEXTAREA_STYLE,
} from './AssistantPanel.constants'
import type { AssistantComposerProps } from './AssistantPanel.types'

export function AssistantComposer({
  input,
  isStreaming,
  canSend,
  onInputChange,
  onSubmit,
}: AssistantComposerProps) {
  return (
    <div className={COMPOSER_STYLE}>
      <textarea
        className={TEXTAREA_STYLE}
        value={input}
        rows={2}
        placeholder={isStreaming ? 'Waiting for the assistant…' : 'Message the assistant…'}
        onChange={(event) => {
          onInputChange(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            onSubmit()
          }
        }}
      />
      <button
        type="button"
        className={canSend ? SEND_STYLE : `${SEND_STYLE} ${SEND_DISABLED_STYLE}`}
        disabled={!canSend}
        onClick={onSubmit}
      >
        Send
      </button>
    </div>
  )
}
