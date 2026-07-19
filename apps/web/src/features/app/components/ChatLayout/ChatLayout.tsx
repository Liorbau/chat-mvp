import type { ReactNode } from 'react'
import { AssistantPanelContainer } from '@/features/ai/components/AssistantPanel/AssistantPanelContainer'
import { TutorPanelContainer } from '@/features/ai/components/TutorPanel/TutorPanelContainer'
import { ProfilePanelContainer } from '@/features/profile/components/ProfilePanel/ProfilePanelContainer'
import { BackButton } from './BackButton'
import { ChatsView } from './ChatsView'
import { PersistentTopBar } from './PersistentTopBar'
import type { ChatLayoutViewProps } from './ChatLayout.types'
import type { ChatMode } from '@/features/app/components/ModeSwitcher/ModeSwitcher.types'

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
  const bodyByMode: Record<ChatMode, ReactNode> = {
    assistant: <AssistantPanelContainer currentUserId={currentUserId} />,
    tutor: <TutorPanelContainer currentUserId={currentUserId} />,
    profile: <ProfilePanelContainer />,
    chats: (
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
    ),
  }

  return (
    <>
      {mode === 'profile' ? (
        <BackButton onClick={onBack} />
      ) : (
        <PersistentTopBar mode={mode} onSelectMode={onSelectMode} onLogout={onLogout} />
      )}
      {bodyByMode[mode]}
    </>
  )
}
