import { useConfirmEmailContext } from '../../ConfirmEmailScreen.context'
import { CONTINUE_BUTTON_STYLE, SUCCESS_STYLE } from '../../ConfirmEmailScreen.styles'

export function SuccessState() {
  const { email, onDone } = useConfirmEmailContext()

  return (
    <>
      <p className={SUCCESS_STYLE}>Your email is now {email}.</p>
      <button type="button" onClick={onDone} className={CONTINUE_BUTTON_STYLE}>
        Continue
      </button>
    </>
  )
}
