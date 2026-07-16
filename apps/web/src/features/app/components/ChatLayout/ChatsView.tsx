import { ConversationListContainer } from '@/features/conversations/components/ConversationListContainer/ConversationListContainer'
import { NewConversationContainer } from '@/features/conversations/components/NewConversation/NewConversationContainer'
import { MessagePanelContainer } from '@/features/messages/components/MessagePanelContainer/MessagePanelContainer'
import {
  MAIN_PANEL_STYLE,
  PANEL_CONTENT_STYLE,
  PANEL_HEADER_STYLE,
  PANEL_HEADING_STYLE,
  PANELS_LAYOUT_STYLE,
  ROOT_LAYOUT_STYLE,
  SIDEBAR_LIST_GAP_STYLE,
  SIDEBAR_STYLE,
} from './ChatLayout.constants'
import type { ChatsViewProps } from './ChatLayout.types'

export function ChatsView({
  currentUserId,
  status,
  conversations,
  error,
  selectedConversationId,
  onSelectConversation,
  onConversationCreated,
  onConversationActivity,
}: ChatsViewProps) {
  return (
    <main className={ROOT_LAYOUT_STYLE}>
      <section className={PANELS_LAYOUT_STYLE}>
        <aside className={SIDEBAR_STYLE}>
          <div className={PANEL_HEADER_STYLE}>
            <h2 className={PANEL_HEADING_STYLE}>Conversations</h2>
          </div>
          <div className={PANEL_CONTENT_STYLE}>
            <NewConversationContainer
              currentUserId={currentUserId}
              onCreated={onConversationCreated}
            />
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

        <div className={MAIN_PANEL_STYLE}>
          <h2 className={PANEL_HEADING_STYLE}>Messages</h2>
          <div className={PANEL_CONTENT_STYLE}>
            <MessagePanelContainer
              selectedConversationId={selectedConversationId}
              currentUserId={currentUserId}
              onConversationActivity={onConversationActivity}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
