import { ErrorToast } from '@/shared/components/ErrorToast/ErrorToast'
import { useUsers } from '@/features/user/context/user.context'
import { useOptimisticMessages } from '@/features/messages/hooks/useOptimisticMessages'
import { MessageComposer } from '@/features/messages/components/MessageComposer/MessageComposer'
import { MessageList } from '@/features/messages/components/MessageList/MessageList'
import { MessageThreadSkeleton } from '@/features/messages/components/MessageThreadSkeleton/MessageThreadSkeleton'
import {
  COMPOSER_AREA_STYLE,
  MESSAGE_PANEL_STYLE,
  THREAD_AREA_STYLE,
} from './MessagePanelContainer.constants'
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
    if (selectedConversationId !== null) {
      onConversationActivity(selectedConversationId, content)
    }
  }

  if (selectedConversationId === null) {
    return <p>Select a conversation to view messages.</p>
  }

  if (status === 'idle' || status === 'loading') {
    return <MessageThreadSkeleton />
  }

  if (status === 'error') {
    return (
      <div>
        <p>{error ?? 'Failed to load messages'}</p>
        <button type="button" onClick={refetch}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={MESSAGE_PANEL_STYLE}>
      {error !== null ? <ErrorToast message={error} /> : null}
      <div className={THREAD_AREA_STYLE}>
        {status === 'empty' ? (
          <p>No messages yet.</p>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            getDisplayName={getUserDisplayName}
            getAvatarUrl={getUserAvatarUrl}
          />
        )}
      </div>
      <div className={COMPOSER_AREA_STYLE}>
        <MessageComposer onSend={handleSendMessage} />
      </div>
    </div>
  )
}
