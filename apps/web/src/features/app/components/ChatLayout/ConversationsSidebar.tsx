import { ConversationListContainer } from '@/features/conversations/components/ConversationListContainer/ConversationListContainer'
import { NewConversationContainer } from '@/features/conversations/components/NewConversation/NewConversationContainer'
import {
  PANEL_CONTENT_STYLE,
  PANEL_HEADER_STYLE,
  PANEL_HEADING_STYLE,
  SIDEBAR_LIST_GAP_STYLE,
  SIDEBAR_STYLE,
} from './ChatLayout.constants'
import type { ConversationsSidebarProps } from './ChatLayout.types'

export function ConversationsSidebar({
  currentUserId,
  status,
  conversations,
  error,
  selectedConversationId,
  onSelectConversation,
  onConversationCreated,
}: ConversationsSidebarProps) {
  return (
    <aside className={SIDEBAR_STYLE}>
      <div className={PANEL_HEADER_STYLE}>
        <h2 className={PANEL_HEADING_STYLE}>Conversations</h2>
      </div>
      <div className={PANEL_CONTENT_STYLE}>
        <NewConversationContainer currentUserId={currentUserId} onCreated={onConversationCreated} />
        <div className={SIDEBAR_LIST_GAP_STYLE}>
          <ConversationListContainer
            status={status}
            conversations={conversations}
            error={error}
            selectedConversationId={selectedConversationId}
            onSelectConversation={onSelectConversation}
          />
        </div>
      </div>
    </aside>
  )
}
