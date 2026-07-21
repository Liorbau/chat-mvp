import { FIELD_STYLE, INPUT_STYLE } from '@/features/auth/authForm.styles'
import type { AuthFieldProps } from './AuthField.types'

export function AuthField({
  label,
  type,
  value,
  autoComplete,
  onChange,
  maxLength,
  minLength,
}: AuthFieldProps) {
  return (
    <label className={FIELD_STYLE}>
      <span>{label}</span>
      <input
        type={type}
        required
        value={value}
        autoComplete={autoComplete}
        maxLength={maxLength}
        minLength={minLength}
        onChange={(event) => onChange(event.target.value)}
        className={INPUT_STYLE}
      />
    </label>
  )
}
