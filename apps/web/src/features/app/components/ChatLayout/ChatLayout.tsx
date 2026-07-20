import { AssistantPanelContainer } from '@/features/ai/components/AssistantPanel/AssistantPanelContainer'
import { TutorPanelContainer } from '@/features/ai/components/TutorPanel/TutorPanelContainer'
import { ProfilePanelContainer } from '@/features/profile/components/ProfilePanel/ProfilePanelContainer'
import { BackButton } from './BackButton'
import { ChatsView } from './ChatsView'
import { PersistentTopBar } from './PersistentTopBar'
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
      {mode === 'assistant' && <AssistantPanelContainer currentUserId={currentUserId} />}
      {mode === 'tutor' && <TutorPanelContainer currentUserId={currentUserId} />}
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
