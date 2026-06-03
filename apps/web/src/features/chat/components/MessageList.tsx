import { useEffect, useRef } from 'react'
import type { OptimisticMessage } from '../hooks/optimisticMessages.types'
import MessageItem from './MessageItem'

type MessageListProps = {
  messages: OptimisticMessage[]
  currentUserId: string
  getDisplayName: (userId: string) => string
}

const MESSAGE_LIST_STYLE = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '10px',
}

const LIST_END_MARKER_STYLE = {
  listStyle: 'none',
  height: '1px',
}

function MessageList({ messages, currentUserId, getDisplayName }: MessageListProps) {
  const listEndReference = useRef<HTMLLIElement | null>(null)

  useEffect(() => {
    listEndReference.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <ul style={MESSAGE_LIST_STYLE}>
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
      <li ref={listEndReference} style={LIST_END_MARKER_STYLE} />
    </ul>
  )
}

export default MessageList
