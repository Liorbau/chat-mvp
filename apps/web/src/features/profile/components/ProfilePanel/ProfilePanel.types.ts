export type NameFormValue = {
  firstName: string
  lastName: string
  onFirstNameChange: (value: string) => void
  onLastNameChange: (value: string) => void
  submitting: boolean
  errors: string[]
  saved: boolean
  changed: boolean
  submit: () => void
}

export type EmailFormValue = {
  email: string
  onEmailChange: (value: string) => void
  submitting: boolean
  errors: string[]
  saved: boolean
  changed: boolean
  submit: () => void
}

export type ProfileFormValue = {
  userName: string
  name: NameFormValue
  email: EmailFormValue
}

export type ErrorListProps = {
  messages: string[]
}

export type SavedNoteProps = {
  show: boolean
}
