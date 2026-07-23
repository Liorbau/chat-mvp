import {
  FIELD_STYLE,
  INPUT_STYLE,
  submitButtonStyle,
} from '@/features/profile/components/ProfilePanel/ProfilePanel.styles'
import { ErrorList } from '@/features/profile/components/ProfilePanel/components/ErrorList/ErrorList'
import { useEmailChangeContext } from '../../EmailSection.context'

export function EmailChangeForm() {
  const { newEmail, onNewEmailChange, errors, disabled, submitLabel, submit } =
    useEmailChangeContext()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <label className={FIELD_STYLE}>
        <span>New email address</span>
        <input
          type="email"
          required
          value={newEmail}
          autoComplete="email"
          placeholder="you@example.com"
          onChange={(event) => onNewEmailChange(event.target.value)}
          className={INPUT_STYLE}
        />
      </label>
      <ErrorList messages={errors} />
      <button type="submit" disabled={disabled} className={submitButtonStyle(disabled)}>
        {submitLabel}
      </button>
    </form>
  )
}
