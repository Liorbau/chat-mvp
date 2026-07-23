import { useUsers } from '@/features/user/context/user.context'
import { useOptimisticMessages } from '@/features/messages/hooks/useOptimisticMessages'
import { MessagePanel } from './MessagePanel'
import type { MessageListItem } from '@/features/messages/components/MessageList/MessageList.types'
import type { MessagePanelContainerProps } from './MessagePanelContainer.types'

export function MessagePanelContainer({
  selectedConversationId,
  currentUserId,
  onConversationActivity,
}: MessagePanelContainerProps) {
  const { getUserDisplayName, getUserAvatarUrl } = useUsers()
  const { status, messages, error, sendMessage, refetch } = useOptimisticMessages(
    selectedConversationId,
    currentUserId,
  )

  async function handleSendMessage(content: string): Promise<void> {
    await sendMessage(content)
    if (selectedConversationId != null) {
      onConversationActivity(selectedConversationId, content)
    }
  }

  const items: MessageListItem[] = messages.map((message) => ({
    message,
    senderDisplayName: getUserDisplayName(message.senderId),
    senderAvatarUrl: getUserAvatarUrl(message.senderId),
  }))

  return (
    <MessagePanel
      selectedConversationId={selectedConversationId}
      status={status}
      items={items}
      currentUserId={currentUserId}
      error={error}
      onSend={handleSendMessage}
      onRetry={refetch}
    />
  )
}
