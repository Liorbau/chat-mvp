import { useState } from 'react'
import { useConversations } from '../hooks/useConversations'
import ConversationListContainer from './ConversationListContainer'
import MessagePanelContainer from './MessagePanelContainer'

type ChatLayoutProps = {
  currentUserId: string
  onLogout: () => void
}

const ROOT_LAYOUT_STYLE = {
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  backgroundColor: '#f8fafc',
}

const PANELS_LAYOUT_STYLE = {
  display: 'grid',
  gridTemplateColumns: '320px 1fr',
  width: '100%',
  minHeight: '100vh',
}

const SIDEBAR_STYLE = {
  borderRight: '1px solid #e2e8f0',
  padding: '16px',
  backgroundColor: '#ffffff',
}

const MAIN_PANEL_STYLE = {
  padding: '16px',
  backgroundColor: '#f8fafc',
}

const PANEL_HEADING_STYLE = { margin: 0, fontSize: '18px', color: '#0f172a' }
const PANEL_CONTENT_STYLE = { marginTop: '12px' }
const PANEL_HEADER_STYLE = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}
const LOGOUT_BUTTON_STYLE = {
  border: '1px solid #cbd5e1',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  borderRadius: '8px',
  padding: '6px 10px',
  cursor: 'pointer',
}

function ChatLayout({ currentUserId, onLogout }: ChatLayoutProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const { status, conversations, error, markConversationActivity } = useConversations()

  return (
    <main style={ROOT_LAYOUT_STYLE}>
      <section style={PANELS_LAYOUT_STYLE}>
        <aside style={SIDEBAR_STYLE}>
          <div style={PANEL_HEADER_STYLE}>
            <h2 style={PANEL_HEADING_STYLE}>Conversations</h2>
            <button
              type="button"
              style={LOGOUT_BUTTON_STYLE}
              onClick={() => {
                setSelectedConversationId(null)
                onLogout()
              }}
            >
              Switch user
            </button>
          </div>
          <div style={PANEL_CONTENT_STYLE}>
            <ConversationListContainer
              status={status}
              conversations={conversations}
              error={error}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
            />
          </div>
        </aside>

        <div style={MAIN_PANEL_STYLE}>
          <h2 style={PANEL_HEADING_STYLE}>Messages</h2>
          <div style={PANEL_CONTENT_STYLE}>
            <MessagePanelContainer
              selectedConversationId={selectedConversationId}
              currentUserId={currentUserId}
              onConversationActivity={markConversationActivity}
            />
          </div>
        </div>
      </section>
    </main>
  )
}

export default ChatLayout
