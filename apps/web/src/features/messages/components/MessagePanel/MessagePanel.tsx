import { ErrorToast } from '@/shared/components/ErrorToast/ErrorToast'
import { MessageComposer } from '@/features/messages/components/MessageComposer/MessageComposer'
import { MessageList } from '@/features/messages/components/MessageList/MessageList'
import { MessageThreadSkeleton } from '@/features/messages/components/MessageThreadSkeleton/MessageThreadSkeleton'
import {
  COMPOSER_AREA_STYLE,
  MESSAGE_PANEL_STYLE,
  THREAD_AREA_STYLE,
} from './MessagePanel.constants'
import type { MessagePanelProps } from './MessagePanel.types'

export function MessagePanel({
  selectedConversationId,
  status,
  items,
  currentUserId,
  error,
  onSend,
  onRetry,
}: MessagePanelProps) {
  return selectedConversationId === null ? (
    <p>Select a conversation to view messages.</p>
  ) : status === 'idle' || status === 'loading' ? (
    <MessageThreadSkeleton />
  ) : status === 'error' ? (
    <div>
      <p>{error ?? 'Failed to load messages'}</p>
      <button type="button" onClick={onRetry}>
        Retry
      </button>
    </div>
  ) : (
    <div className={MESSAGE_PANEL_STYLE}>
      {error !== null ? <ErrorToast message={error} /> : null}
      <div className={THREAD_AREA_STYLE}>
        {status === 'empty' ? (
          <p>No messages yet.</p>
        ) : (
          <MessageList items={items} currentUserId={currentUserId} />
        )}
      </div>
      <div className={COMPOSER_AREA_STYLE}>
        <MessageComposer onSend={onSend} />
      </div>
    </div>
  )
}
