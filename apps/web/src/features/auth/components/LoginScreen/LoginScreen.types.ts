export type LoginFormValue = {
  email: string
  password: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  submitting: boolean
  errors: string[]
  submit: () => void
}

export type LoginScreenProps = {
  onSwitchToSignup: () => void
  onForgotPassword: () => void
}
