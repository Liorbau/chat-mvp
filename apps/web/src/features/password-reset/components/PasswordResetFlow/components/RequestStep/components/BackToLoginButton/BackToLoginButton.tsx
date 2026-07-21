import { AuthSwitchButton } from '@/features/auth/components/AuthSwitchButton/AuthSwitchButton'
import { useRequestResetContext } from '../../RequestStep.context'
import { BACK_TO_LOGIN_LABEL } from './BackToLoginButton.constants'

export function BackToLoginButton() {
  const { onSwitchToLogin } = useRequestResetContext()

  return <AuthSwitchButton label={BACK_TO_LOGIN_LABEL} onClick={onSwitchToLogin} />
}
