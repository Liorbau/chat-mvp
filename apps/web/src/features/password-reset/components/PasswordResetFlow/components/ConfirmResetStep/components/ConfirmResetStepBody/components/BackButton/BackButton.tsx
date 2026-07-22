import { AuthSwitchButton } from '@/features/auth/components/AuthSwitchButton/AuthSwitchButton'
import { useConfirmResetContext } from '../../../../ConfirmResetStep.context'
import { BACK_LABEL } from './BackButton.constants'

export function BackButton() {
  const { onBack } = useConfirmResetContext()

  return <AuthSwitchButton label={BACK_LABEL} onClick={onBack} />
}
