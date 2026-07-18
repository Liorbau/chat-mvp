import { MessagePanelContainer } from '@/features/messages/components/MessagePanelContainer/MessagePanelContainer'
import { MAIN_PANEL_STYLE, PANEL_CONTENT_STYLE, PANEL_HEADING_STYLE } from './ChatLayout.constants'
import type { MessagesPaneProps } from './ChatLayout.types'

export function MessagesPane({
  currentUserId,
  selectedConversationId,
  onConversationActivity,
}: MessagesPaneProps) {
  return (
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
  )
}
