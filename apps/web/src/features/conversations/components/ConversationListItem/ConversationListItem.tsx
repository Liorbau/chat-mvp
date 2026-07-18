import { UserAvatar } from '@/features/user/components/UserAvatar/UserAvatar'
import {
  CONVERSATION_BUTTON_STYLE,
  CONVERSATION_ITEM_STYLE,
  CONVERSATION_ROW_STYLE,
  CONVERSATION_TITLE_STYLE,
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
        <span className={CONVERSATION_ROW_STYLE}>
          <UserAvatar name={conversation.avatarName} avatarUrl={conversation.avatarUrl} size="md" />
          <span className={CONVERSATION_TITLE_STYLE}>{conversation.title}</span>
        </span>
      </button>
    </li>
  )
}
