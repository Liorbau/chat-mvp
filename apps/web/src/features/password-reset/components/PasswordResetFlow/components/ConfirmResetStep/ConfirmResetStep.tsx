import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { AuthCardHeader } from '@/features/auth/components/AuthCardHeader/AuthCardHeader'
import { ConfirmResetStepBody } from './components/ConfirmResetStepBody/ConfirmResetStepBody'
import { CONFIRM_SUBTITLE, CONFIRM_TITLE } from './ConfirmResetStep.constants'

export function ConfirmResetStep() {
  return (
    <AuthCard>
      <AuthCardHeader title={CONFIRM_TITLE} subtitle={CONFIRM_SUBTITLE} />
      <ConfirmResetStepBody />
    </AuthCard>
  )
}
