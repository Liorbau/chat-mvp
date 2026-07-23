import {
  ACTION_BUTTON_STYLE,
  BUTTON_ROW_STYLE,
  ERROR_TEXT_STYLE,
  FORM_STYLE,
  PRIMARY_BUTTON_STYLE,
  SELECT_STYLE,
} from '../../NewConversation.styles'
import { useNewConversationContext } from '../../NewConversation.context'

export function NewConversationForm() {
  const { others, selectedUserId, errorMessage, isBusy, onSelect, create, cancel } =
    useNewConversationContext()

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

      {errorMessage != null ? (
        <p role="alert" className={ERROR_TEXT_STYLE}>
          {errorMessage}
        </p>
      ) : null}

      <div className={BUTTON_ROW_STYLE}>
        <button
          type="button"
          className={PRIMARY_BUTTON_STYLE}
          disabled={isBusy || selectedUserId === ''}
          onClick={create}
        >
          {isBusy ? 'Creating...' : 'Create'}
        </button>
        <button type="button" className={ACTION_BUTTON_STYLE} onClick={cancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}
