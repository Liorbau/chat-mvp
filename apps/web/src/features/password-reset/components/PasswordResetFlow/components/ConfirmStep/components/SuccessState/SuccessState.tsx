import { useConfirmResetContext } from '../../ConfirmStep.context'
import { CONTINUE_BUTTON_STYLE, SUCCESS_STYLE } from './SuccessState.styles'
import { CONTINUE_LABEL, SUCCESS_MESSAGE } from './SuccessState.constants'

export function SuccessState() {
  const { onSuccess } = useConfirmResetContext()

  return (
    <>
      <p className={SUCCESS_STYLE}>{SUCCESS_MESSAGE}</p>
      <button type="button" onClick={onSuccess} className={CONTINUE_BUTTON_STYLE}>
        {CONTINUE_LABEL}
      </button>
    </>
  )
}
