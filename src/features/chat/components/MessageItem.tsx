import type { OptimisticMessage } from '../hooks/optimisticMessages.types'

type MessageItemProps = {
  message: OptimisticMessage
  currentUserId: string
  senderDisplayName: string
}

const MESSAGE_ROW_STYLE = {
  display: 'flex',
}

const BASE_BUBBLE_STYLE = {
  maxWidth: '70%',
  borderRadius: '18px',
  padding: '12px 14px',
  border: '1px solid rgba(148, 163, 184, 0.35)',
  backdropFilter: 'blur(1px)',
  fontSize: '16px',
  lineHeight: 1.45,
}

const SENDER_STYLE = {
  display: 'block',
  fontSize: '11px',
  marginBottom: '4px',
  opacity: 0.75,
}

const PENDING_STYLE = {
  display: 'block',
  marginTop: '6px',
  fontSize: '11px',
  opacity: 0.7,
}

function MessageItem({ message, currentUserId, senderDisplayName }: MessageItemProps) {
  const isPending = message.deliveryStatus === 'pending'
  const isCurrentUserMessage = message.senderId === currentUserId

  const rowStyle = {
    ...MESSAGE_ROW_STYLE,
    justifyContent: isCurrentUserMessage ? 'flex-start' : 'flex-end',
  }

  const bubbleStyle = {
    ...BASE_BUBBLE_STYLE,
    backgroundColor: isCurrentUserMessage
      ? 'rgba(191, 219, 254, 0.65)'
      : 'rgba(255, 255, 255, 0.72)',
    color: '#0f172a',
  }

  return (
    <li style={rowStyle}>
      <div style={bubbleStyle}>
        <span style={SENDER_STYLE}>{senderDisplayName}</span>
        <span>{message.content}</span>
        {isPending ? <em style={PENDING_STYLE}>sending...</em> : null}
      </div>
    </li>
  )
}

export default MessageItem
