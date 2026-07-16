export type LoginScreenProps = {
  email: string
  password: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  submitting: boolean
  errors: string[]
  onSubmit: () => void
  onSwitchToSignup: () => void
}
