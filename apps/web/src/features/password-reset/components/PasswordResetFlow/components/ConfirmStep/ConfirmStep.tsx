import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { ConfirmStepBody } from './components/ConfirmStepBody/ConfirmStepBody'
import { CONFIRM_SUBTITLE, CONFIRM_TITLE } from './ConfirmStep.constants'

export function ConfirmStep() {
  return (
    <AuthCard title={CONFIRM_TITLE} subtitle={CONFIRM_SUBTITLE}>
      <ConfirmStepBody />
    </AuthCard>
  )
}
