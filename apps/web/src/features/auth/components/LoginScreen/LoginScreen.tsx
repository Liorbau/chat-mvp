import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { AuthSwitchButton } from '@/features/auth/components/AuthSwitchButton/AuthSwitchButton'
import { LoginForm } from './LoginForm'
import type { LoginScreenProps } from './LoginScreen.types'

export function LoginScreen({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  submitting,
  errors,
  onSubmit,
  onSwitchToSignup,
}: LoginScreenProps) {
  return (
    <AuthCard title="Log in" subtitle="Welcome back to the chat.">
      <LoginForm
        email={email}
        password={password}
        onEmailChange={onEmailChange}
        onPasswordChange={onPasswordChange}
        submitting={submitting}
        errors={errors}
        onSubmit={onSubmit}
      />
      <AuthSwitchButton label="Need an account? Sign up" onClick={onSwitchToSignup} />
    </AuthCard>
  )
}
