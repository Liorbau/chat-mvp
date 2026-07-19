import {
  CONVERSATION_BUTTON_STYLE,
  CONVERSATION_ITEM_STYLE,
  SELECTED_CONVERSATION_BUTTON_STYLE,
} from './ConversationListItem.constants'
import type { ConversationListItemProps } from './ConversationListItem.types'

export function ConversationListItem({
  conversation,
  isSelected,
  onSelect,
}: ConversationListItemProps) {
  const buttonStyle = isSelected
    ? `${CONVERSATION_BUTTON_STYLE} ${SELECTED_CONVERSATION_BUTTON_STYLE}`
    : CONVERSATION_BUTTON_STYLE

  return (
    <li className={CONVERSATION_ITEM_STYLE}>
      <button
        type="button"
        className={buttonStyle}
        aria-current={isSelected ? 'true' : undefined}
        onClick={() => {
          onSelect(conversation.id)
        }}
      >
        {conversation.title}
      </button>
    </li>
  )
}
