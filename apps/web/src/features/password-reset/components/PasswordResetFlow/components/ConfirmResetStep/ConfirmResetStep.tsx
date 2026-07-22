import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { ConfirmResetStepBody } from './components/ConfirmResetStepBody/ConfirmResetStepBody'
import { CONFIRM_SUBTITLE, CONFIRM_TITLE } from './ConfirmResetStep.constants'

export function ConfirmResetStep() {
  return (
    <AuthCard title={CONFIRM_TITLE} subtitle={CONFIRM_SUBTITLE}>
      <ConfirmResetStepBody />
    </AuthCard>
  )
}
