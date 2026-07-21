import { UserAvatarContainer } from '@/features/user/components/UserAvatar/UserAvatarContainer'
import {
  BASE_BUBBLE_STYLE,
  MESSAGE_ROW_INNER_STYLE,
  MESSAGE_ROW_STYLE,
  MINE_BUBBLE_STYLE,
  OTHER_BUBBLE_STYLE,
  PENDING_STYLE,
  SENDER_STYLE,
} from './MessageItem.styles'
import type { MessageItemProps } from './MessageItem.types'

export function MessageItem({
  message,
  currentUserId,
  senderDisplayName,
  senderAvatarUrl,
}: MessageItemProps) {
  const isPending = message.deliveryStatus === 'pending'
  const isCurrentUserMessage = message.senderId === currentUserId

  const rowStyle = `${MESSAGE_ROW_STYLE} ${isCurrentUserMessage ? 'justify-start' : 'justify-end'}`
  const bubbleStyle = `${BASE_BUBBLE_STYLE} ${isCurrentUserMessage ? MINE_BUBBLE_STYLE : OTHER_BUBBLE_STYLE}`
  const innerStyle = `${MESSAGE_ROW_INNER_STYLE} ${isCurrentUserMessage ? '' : 'flex-row-reverse'}`

  return (
    <li className={rowStyle}>
      <div className={innerStyle}>
        <UserAvatarContainer name={senderDisplayName} avatarUrl={senderAvatarUrl} size="sm" />
        <div className={bubbleStyle}>
          <span className={SENDER_STYLE}>{senderDisplayName}</span>
          <span>{message.content}</span>
          {isPending ? <em className={PENDING_STYLE}>sending...</em> : null}
        </div>
      </div>
    </li>
  )
}
