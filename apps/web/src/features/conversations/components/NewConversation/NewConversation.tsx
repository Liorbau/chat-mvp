import { NEW_BUTTON_STYLE } from './NewConversation.constants'
import { NewConversationForm } from './NewConversationForm'
import type { NewConversationViewProps } from './NewConversation.types'

export function NewConversation({
  isOpen,
  others,
  selectedUserId,
  errorMessage,
  isBusy,
  onOpen,
  onSelect,
  onCreate,
  onCancel,
}: NewConversationViewProps) {
  if (!isOpen) {
    return (
      <button type="button" className={NEW_BUTTON_STYLE} onClick={onOpen}>
        + New conversation
      </button>
    )
  }

  return (
    <NewConversationForm
      others={others}
      selectedUserId={selectedUserId}
      errorMessage={errorMessage}
      isBusy={isBusy}
      onSelect={onSelect}
      onCreate={onCreate}
      onCancel={onCancel}
    />
  )
}
