import {
  FIELD_STYLE,
  INPUT_STYLE,
  SECTION_HEADING_STYLE,
  SECTION_STYLE,
  submitButtonStyle,
} from './ProfilePanel.constants'
import type { EmailFormProps } from './ProfilePanel.types'
import { ErrorList } from './ErrorList'
import { SavedNote } from './SavedNote'

export function EmailForm({
  email,
  onEmailChange,
  submitting,
  errors,
  saved,
  changed,
  onSubmit,
}: EmailFormProps) {
  const disabled = submitting || !changed
  return (
    <form
      className={SECTION_STYLE}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <h2 className={SECTION_HEADING_STYLE}>Email</h2>
      <label className={FIELD_STYLE}>
        <span>Email address</span>
        <input
          type="email"
          required
          value={email}
          autoComplete="email"
          onChange={(event) => onEmailChange(event.target.value)}
          className={INPUT_STYLE}
        />
      </label>
      <ErrorList messages={errors} />
      <SavedNote show={saved} />
      <button type="submit" disabled={disabled} className={submitButtonStyle(disabled)}>
        {submitting ? 'Saving...' : 'Save email'}
      </button>
    </form>
  )
}
