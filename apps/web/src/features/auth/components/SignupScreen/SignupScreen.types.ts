export type SignupScreenProps = {
  firstName: string
  lastName: string
  email: string
  password: string
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  submitting: boolean
  errors: string[]
  onSubmit: () => void
  onSwitchToLogin: () => void
}
