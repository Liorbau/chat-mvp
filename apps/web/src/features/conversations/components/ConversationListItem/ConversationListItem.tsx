import { useAuth } from '@/features/auth/context/auth.context'
import { UserAvatar } from '@/features/user/components/UserAvatar/UserAvatar'
import { useUsers } from '@/features/user/context/user.context'
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
  const { user } = useAuth()
  const { getUserDisplayName, getUserAvatarUrl } = useUsers()

  const buttonStyle = isSelected
    ? `${CONVERSATION_BUTTON_STYLE} ${SELECTED_CONVERSATION_BUTTON_STYLE}`
    : CONVERSATION_BUTTON_STYLE

  // For a direct conversation the avatar is the other participant's; initials
  // fall back to their name (not the "Chat with …" title).
  const otherId = conversation.participantIds.find((id) => id !== user?.id)
  const avatarUrl = otherId !== undefined ? getUserAvatarUrl(otherId) : null
  const avatarName =
    otherId !== undefined ? getUserDisplayName(otherId) : (conversation.title ?? 'Conversation')

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
          <UserAvatar name={avatarName} avatarUrl={avatarUrl} size="md" />
          <span className={CONVERSATION_TITLE_STYLE}>{conversation.title}</span>
        </span>
      </button>
    </li>
  )
}
