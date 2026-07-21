import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { AlreadyHaveCodeButton } from './components/AlreadyHaveCodeButton/AlreadyHaveCodeButton'
import { BackToLoginButton } from './components/BackToLoginButton/BackToLoginButton'
import { RequestForm } from './components/RequestForm/RequestForm'
import { REQUEST_SUBTITLE, REQUEST_TITLE } from './RequestStep.constants'

export function RequestStep() {
  return (
    <AuthCard title={REQUEST_TITLE} subtitle={REQUEST_SUBTITLE}>
      <RequestForm />
      <AlreadyHaveCodeButton />
      <BackToLoginButton />
    </AuthCard>
  )
}
