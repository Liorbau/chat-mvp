import { useComposerContext } from '@/features/ai/context/composer.context'
import { SEND_LABEL } from './Composer.constants'
import { COMPOSER_STYLE, sendButtonClass, TEXTAREA_STYLE } from './Composer.styles'
import { composerPlaceholder } from './Composer.utils'

export function Composer() {
  const { conversationType, input, isStreaming, canSend, onInputChange, onInputKeyDown, submit } =
    useComposerContext()

  return (
    <div className={COMPOSER_STYLE[conversationType]}>
      <textarea
        className={TEXTAREA_STYLE[conversationType]}
        value={input}
        rows={2}
        placeholder={composerPlaceholder(conversationType, isStreaming)}
        onChange={(event) => {
          onInputChange(event.target.value)
        }}
        onKeyDown={onInputKeyDown}
      />
      <button
        type="button"
        className={sendButtonClass(conversationType, canSend)}
        disabled={!canSend}
        onClick={submit}
      >
        {SEND_LABEL}
      </button>
    </div>
  )
}
