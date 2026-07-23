import {
  FIELD_STYLE,
  INPUT_STYLE,
  SECTION_HEADING_STYLE,
  SECTION_STYLE,
  submitButtonStyle,
} from '@/features/profile/components/ProfilePanel/ProfilePanel.styles'
import { ErrorList } from '@/features/profile/components/ProfilePanel/ErrorList'
import { SavedNote } from '@/features/profile/components/ProfilePanel/SavedNote'
import { useNameSectionContext } from './NameSection.context'

export function NameSection() {
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
  } = useNameSectionContext()
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
