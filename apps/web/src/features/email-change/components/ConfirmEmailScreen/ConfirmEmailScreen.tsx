import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { useConfirmEmailContext } from './ConfirmEmailScreen.context'
import { PendingState } from './components/PendingState/PendingState'
import { SuccessState } from './components/SuccessState/SuccessState'
import { InvalidState } from './components/InvalidState/InvalidState'

export function ConfirmEmailScreen() {
  const { status } = useConfirmEmailContext()

  return (
    <AuthCard title="Confirm email change" subtitle="Finishing your email address update.">
      {status === 'pending' && <PendingState />}
      {status === 'success' && <SuccessState />}
      {status === 'invalid' && <InvalidState />}
    </AuthCard>
  )
}
