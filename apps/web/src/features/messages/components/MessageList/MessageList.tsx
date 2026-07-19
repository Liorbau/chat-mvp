import { useScrollToBottom } from '@/shared/hooks/useScrollToBottom'
import { MessageItem } from '@/features/messages/components/MessageItem/MessageItem'
import { LIST_END_MARKER_STYLE, MESSAGE_LIST_STYLE } from './MessageList.constants'
import type { MessageListProps } from './MessageList.types'

export function MessageList({ messages, currentUserId, getDisplayName }: MessageListProps) {
  const listEndReference = useScrollToBottom<HTMLLIElement>(messages.length > 0, [messages])

  return (
    <ul className={MESSAGE_LIST_STYLE}>
      {messages.map((message) => {
        return (
          <MessageItem
            key={message.id}
            message={message}
            currentUserId={currentUserId}
            senderDisplayName={getDisplayName(message.senderId)}
          />
        )
      })}
      <li ref={listEndReference} className={LIST_END_MARKER_STYLE} />
    </ul>
  )
}
