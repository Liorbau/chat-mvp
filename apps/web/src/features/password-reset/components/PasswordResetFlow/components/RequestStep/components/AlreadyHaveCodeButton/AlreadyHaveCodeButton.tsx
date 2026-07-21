import { AuthSwitchButton } from '@/features/auth/components/AuthSwitchButton/AuthSwitchButton'
import { useRequestResetContext } from '../../RequestStep.context'
import { ALREADY_HAVE_CODE_LABEL } from './AlreadyHaveCodeButton.constants'

export function AlreadyHaveCodeButton() {
  const { onAlreadyHaveCode } = useRequestResetContext()

  return <AuthSwitchButton label={ALREADY_HAVE_CODE_LABEL} onClick={onAlreadyHaveCode} />
}
