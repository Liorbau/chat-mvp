import { AiPanelContainer } from '@/features/ai/components/AiPanel/AiPanelContainer'
import { ProfilePanelContainer } from '@/features/profile/components/ProfilePanel/ProfilePanelContainer'
import { BackButton } from './components/BackButton/BackButton'
import { ChatsView } from './components/ChatsView/ChatsView'
import { PersistentTopBar } from './components/PersistentTopBar/PersistentTopBar'
import type { ChatLayoutViewProps } from './ChatLayout.types'

export function ChatLayout({
  mode,
  currentUserId,
  status,
  conversations,
  error,
  selectedConversationId,
  onSelectMode,
  onLogout,
  onBack,
  onSelectConversation,
  onConversationCreated,
  onConversationActivity,
}: ChatLayoutViewProps) {
  return (
    <>
      {mode === 'profile' ? (
        <BackButton onClick={onBack} />
      ) : (
        <PersistentTopBar mode={mode} onSelectMode={onSelectMode} onLogout={onLogout} />
      )}
      {mode === 'assistant' && <AiPanelContainer currentUserId={currentUserId} mode="assistant" />}
      {mode === 'tutor' && <AiPanelContainer currentUserId={currentUserId} mode="tutor" />}
      {mode === 'profile' && <ProfilePanelContainer />}
      {mode === 'chats' && (
        <ChatsView
          currentUserId={currentUserId}
          status={status}
          conversations={conversations}
          error={error}
          selectedConversationId={selectedConversationId}
          onSelectConversation={onSelectConversation}
          onConversationCreated={onConversationCreated}
          onConversationActivity={onConversationActivity}
        />
      )}
    </>
  )
}
