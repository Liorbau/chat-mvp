import { NEW_BUTTON_STYLE } from './NewConversation.constants'
import { useNewConversationContext } from './NewConversation.context'
import { NewConversationForm } from './NewConversationForm'

export function NewConversation() {
  const { isOpen, open } = useNewConversationContext()

  return isOpen ? (
    <NewConversationForm />
  ) : (
    <button type="button" className={NEW_BUTTON_STYLE} onClick={open}>
      + New conversation
    </button>
  )
}
