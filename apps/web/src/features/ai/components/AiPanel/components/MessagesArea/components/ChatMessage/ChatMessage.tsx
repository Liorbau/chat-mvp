import { useComposerContext } from '@/features/ai/context/composer.context'
import { bubbleClass, rowClass, SENDER_LABEL_STYLE } from './ChatMessage.styles'
import type { ChatMessageProps } from './ChatMessage.types'
import { senderLabel } from './ChatMessage.utils'
import { MessageSources } from './components/MessageSources/MessageSources'

export function ChatMessage({ message }: ChatMessageProps) {
  const { currentUserId, conversationType } = useComposerContext()
  const mine = message.senderId === currentUserId

  return (
    <div className={rowClass(mine)}>
      <div className={bubbleClass(conversationType, mine)}>
        <span className={SENDER_LABEL_STYLE}>
          {senderLabel(message, currentUserId, conversationType)}
        </span>
        {message.content}
        <MessageSources citations={message.citations} />
      </div>
    </div>
  )
}
