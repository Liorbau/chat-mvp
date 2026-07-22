import { AuthCard } from '@/features/auth/components/AuthCard/AuthCard'
import { AuthCardHeader } from '@/features/auth/components/AuthCardHeader/AuthCardHeader'
import { AuthSwitchButton } from '@/features/auth/components/AuthSwitchButton/AuthSwitchButton'
import { LoginForm } from './LoginForm'
import type { LoginScreenProps } from './LoginScreen.types'

export function LoginScreen({ onSwitchToSignup, onForgotPassword }: LoginScreenProps) {
  return (
    <AuthCard>
      <AuthCardHeader title="Log in" subtitle="Welcome back to the chat." />
      <LoginForm />
      <AuthSwitchButton label="Need an account? Sign up" onClick={onSwitchToSignup} />
      <AuthSwitchButton label="Forgot password?" onClick={onForgotPassword} />
    </AuthCard>
  )
}
