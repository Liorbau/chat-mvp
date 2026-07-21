export type EmailChangeContextValue = {
  currentEmail: string
  previousEmails: string[]
  hasPreviousEmails: boolean
  newEmail: string
  onNewEmailChange: (value: string) => void
  errors: string[]
  disabled: boolean
  submitLabel: string
  sentTo: string | null
  submit: () => void
}
