import { useConfirmEmailContext } from '../../ConfirmEmailScreen.context'
import { CONTINUE_BUTTON_STYLE, ERROR_STYLE } from '../../ConfirmEmailScreen.styles'

export function InvalidState() {
  const { error, onDone } = useConfirmEmailContext()

  return (
    <>
      <p className={ERROR_STYLE}>{error}</p>
      <button type="button" onClick={onDone} className={CONTINUE_BUTTON_STYLE}>
        Continue
      </button>
    </>
  )
}
