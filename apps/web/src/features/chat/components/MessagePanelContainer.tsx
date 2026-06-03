import { useOptimisticMessages } from '../hooks/useOptimisticMessages'
import { getMockUserDisplayName } from '../mocks/mockData'
import ErrorToast from './ErrorToast'
import MessageComposer from './MessageComposer'
import MessageList from './MessageList'
import MessageThreadSkeleton from './MessageThreadSkeleton'

type MessagePanelContainerProps = {
  selectedConversationId: string | null
  currentUserId: string
  onConversationActivity: (conversationId: string, lastMessagePreview: string) => void
}

const MESSAGE_PANEL_STYLE = {
  height: 'calc(100vh - 120px)',
  display: 'flex',
  flexDirection: 'column' as const,
  minHeight: 0,
}

const THREAD_AREA_STYLE = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto' as const,
  paddingRight: '4px',
}

const COMPOSER_AREA_STYLE = {
  marginTop: '10px',
}

function MessagePanelContainer({
  selectedConversationId,
  currentUserId,
  onConversationActivity,
}: MessagePanelContainerProps) {
  const { status, messages, error, sendMessage, refetch } =
    useOptimisticMessages(selectedConversationId)

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
    <div style={MESSAGE_PANEL_STYLE}>
      {error !== null ? <ErrorToast message={error} /> : null}
      <div style={THREAD_AREA_STYLE}>
        {status === 'empty' ? (
          <p>No messages yet.</p>
        ) : (
          <MessageList
            messages={messages}
            currentUserId={currentUserId}
            getDisplayName={getMockUserDisplayName}
          />
        )}
      </div>
      <div style={COMPOSER_AREA_STYLE}>
        <MessageComposer onSend={handleSendMessage} />
      </div>
    </div>
  )
}

export default MessagePanelContainer
