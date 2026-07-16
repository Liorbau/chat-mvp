import {
  ACTION_BUTTON_STYLE,
  BUTTON_ROW_STYLE,
  ERROR_TEXT_STYLE,
  FORM_STYLE,
  PRIMARY_BUTTON_STYLE,
  SELECT_STYLE,
} from './NewConversation.constants'
import type { NewConversationFormProps } from './NewConversation.types'

export function NewConversationForm({
  others,
  selectedUserId,
  errorMessage,
  isBusy,
  onSelect,
  onCreate,
  onCancel,
}: NewConversationFormProps) {
  return (
    <div className={FORM_STYLE}>
      <select
        value={selectedUserId}
        onChange={(event) => {
          onSelect(event.target.value)
        }}
        className={SELECT_STYLE}
      >
        {others.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {candidate.name}
          </option>
        ))}
      </select>

      {errorMessage !== null ? (
        <p role="alert" className={ERROR_TEXT_STYLE}>
          {errorMessage}
        </p>
      ) : null}

      <div className={BUTTON_ROW_STYLE}>
        <button
          type="button"
          className={PRIMARY_BUTTON_STYLE}
          disabled={isBusy || selectedUserId === ''}
          onClick={onCreate}
        >
          {isBusy ? 'Creating...' : 'Create'}
        </button>
        <button type="button" className={ACTION_BUTTON_STYLE} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
