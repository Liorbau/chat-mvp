import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { AuthSwitchButton } from '@/features/auth/components/AuthSwitchButton/AuthSwitchButton'
import { SignupForm } from './SignupForm'
import type { SignupScreenProps } from './SignupScreen.types'

export function SignupScreen({
  firstName,
  lastName,
  email,
  password,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  submitting,
  errors,
  onSubmit,
  onSwitchToLogin,
}: SignupScreenProps) {
  return (
    <AuthCard title="Create account" subtitle="Join the chat in a few seconds.">
      <SignupForm
        firstName={firstName}
        lastName={lastName}
        email={email}
        password={password}
        onFirstNameChange={onFirstNameChange}
        onLastNameChange={onLastNameChange}
        onEmailChange={onEmailChange}
        onPasswordChange={onPasswordChange}
        submitting={submitting}
        errors={errors}
        onSubmit={onSubmit}
      />
      <AuthSwitchButton label="Already have an account? Log in" onClick={onSwitchToLogin} />
    </AuthCard>
  )
}
