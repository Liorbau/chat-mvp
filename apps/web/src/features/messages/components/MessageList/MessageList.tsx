import { useScrollToBottom } from '@/shared/hooks/useScrollToBottom'
import { MessageItem } from '@/features/messages/components/MessageItem/MessageItem'
import { LIST_END_MARKER_STYLE, MESSAGE_LIST_STYLE } from './MessageList.styles'
import type { MessageListProps } from './MessageList.types'

export function MessageList({ items, currentUserId }: MessageListProps) {
  const listEndReference = useScrollToBottom<HTMLLIElement>(items.length > 0, [items])

  return (
    <ul className={MESSAGE_LIST_STYLE}>
      {items.map(({ message, senderDisplayName, senderAvatarUrl }) => (
        <MessageItem
          key={message.id}
          message={message}
          currentUserId={currentUserId}
          senderDisplayName={senderDisplayName}
          senderAvatarUrl={senderAvatarUrl}
        />
      ))}
      <li ref={listEndReference} className={LIST_END_MARKER_STYLE} />
    </ul>
  )
}
