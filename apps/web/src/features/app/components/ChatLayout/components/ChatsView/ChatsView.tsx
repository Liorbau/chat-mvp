import { PANELS_LAYOUT_STYLE, ROOT_LAYOUT_STYLE } from '../../ChatLayout.styles'
import type { ChatsViewProps } from '../../ChatLayout.types'
import { ConversationsSidebar } from './components/ConversationsSidebar/ConversationsSidebar'
import { MessagesPane } from './components/MessagesPane/MessagesPane'

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
        <ConversationsSidebar
          currentUserId={currentUserId}
          status={status}
          conversations={conversations}
          error={error}
          selectedConversationId={selectedConversationId}
          onSelectConversation={onSelectConversation}
          onConversationCreated={onConversationCreated}
        />
        <MessagesPane
          currentUserId={currentUserId}
          selectedConversationId={selectedConversationId}
          onConversationActivity={onConversationActivity}
        />
      </section>
    </main>
  )
}
