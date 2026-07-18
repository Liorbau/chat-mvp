export type AuthFieldProps = {
  label: string
  type: string
  value: string
  autoComplete: string
  onChange: (value: string) => void
  maxLength?: number
  minLength?: number
}
