import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { AuthCardHeader } from '@/features/auth/components/AuthCardHeader/AuthCardHeader'
import { AlreadyHaveCodeButton } from './components/AlreadyHaveCodeButton/AlreadyHaveCodeButton'
import { BackToLoginButton } from './components/BackToLoginButton/BackToLoginButton'
import { RequestForm } from './components/RequestForm/RequestForm'
import { REQUEST_SUBTITLE, REQUEST_TITLE } from './RequestCodeStep.constants'

export function RequestCodeStep() {
  return (
    <AuthCard>
      <AuthCardHeader title={REQUEST_TITLE} subtitle={REQUEST_SUBTITLE} />
      <RequestForm />
      <AlreadyHaveCodeButton />
      <BackToLoginButton />
    </AuthCard>
  )
}
