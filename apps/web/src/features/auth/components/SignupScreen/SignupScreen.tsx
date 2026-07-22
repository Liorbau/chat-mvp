import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { AuthCardHeader } from '@/features/auth/components/AuthCardHeader/AuthCardHeader'
import { AuthSwitchButton } from '@/features/auth/components/AuthSwitchButton/AuthSwitchButton'
import { SignupForm } from './SignupForm'
import type { SignupScreenProps } from './SignupScreen.types'

export function SignupScreen({ onSwitchToLogin }: SignupScreenProps) {
  return (
    <AuthCard>
      <AuthCardHeader title="Create account" subtitle="Join the chat in a few seconds." />
      <SignupForm />
      <AuthSwitchButton label="Already have an account? Log in" onClick={onSwitchToLogin} />
    </AuthCard>
  )
}
