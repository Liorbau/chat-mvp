import {
  FIELD_STYLE,
  INPUT_STYLE,
  SECTION_HEADING_STYLE,
  SECTION_STYLE,
  submitButtonStyle,
} from './ProfilePanel.constants'
import { useProfileContext } from './ProfilePanel.context'
import { ErrorList } from './ErrorList'
import { SavedNote } from './SavedNote'

export function NameForm() {
  const {
    firstName,
    lastName,
    onFirstNameChange,
    onLastNameChange,
    submitting,
    errors,
    saved,
    changed,
    submit,
  } = useProfileContext().name
  const disabled = submitting || !changed

  return (
    <form
      className={SECTION_STYLE}
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <h2 className={SECTION_HEADING_STYLE}>Name</h2>
      <label className={FIELD_STYLE}>
        <span>First name</span>
        <input
          type="text"
          required
          maxLength={100}
          value={firstName}
          autoComplete="given-name"
          onChange={(event) => onFirstNameChange(event.target.value)}
          className={INPUT_STYLE}
        />
      </label>
      <label className={FIELD_STYLE}>
        <span>Last name</span>
        <input
          type="text"
          required
          maxLength={100}
          value={lastName}
          autoComplete="family-name"
          onChange={(event) => onLastNameChange(event.target.value)}
          className={INPUT_STYLE}
        />
      </label>
      <ErrorList messages={errors} />
      <SavedNote show={saved} />
      <button type="submit" disabled={disabled} className={submitButtonStyle(disabled)}>
        {submitting ? 'Saving...' : 'Save name'}
      </button>
    </form>
  )
}
