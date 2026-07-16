export type NameFormProps = {
  firstName: string
  lastName: string
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  submitting: boolean
  errors: string[]
  saved: boolean
  changed: boolean
  onSubmit: () => void
}

export type EmailFormProps = {
  email: string
  onEmailChange: (value: string) => void
  submitting: boolean
  errors: string[]
  saved: boolean
  changed: boolean
  onSubmit: () => void
}

export type ProfilePanelProps = {
  userName: string
  name: NameFormProps
  email: EmailFormProps
}
