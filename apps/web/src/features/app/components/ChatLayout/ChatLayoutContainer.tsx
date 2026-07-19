import { useState } from 'react'
import type { Conversation } from '@chat/contract'
import { useConversations } from '@/features/conversations/hooks/useConversations'
import { useUsers } from '@/features/user/context/user.context'
import { ChatLayout } from './ChatLayout'
import type { ChatLayoutProps } from './ChatLayout.types'
import type { ChatMode } from '@/features/app/components/ModeSwitcher/ModeSwitcher.types'

function deriveConversationTitle(
  conversation: Conversation,
  currentUserId: string,
  getUserDisplayName: (userId: string) => string,
): string {
  const otherIds = conversation.participantIds.filter((id) => id !== currentUserId)
  const otherId = otherIds.length === 1 ? otherIds[0] : undefined
  if (otherId !== undefined) {
    return `Chat with ${getUserDisplayName(otherId)}`
  }

  return conversation.title ?? 'Conversation'
}

export function ChatLayoutContainer({ currentUserId, onLogout }: ChatLayoutProps) {
  const { getUserDisplayName } = useUsers()
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [mode, setMode] = useState<ChatMode>('chats')
  // The mode to return to when leaving the profile page via the back arrow.
  const [returnMode, setReturnMode] = useState<ChatMode>('chats')
  const { status, conversations, error, markConversationActivity, refetch } = useConversations()

  function handleConversationCreated(conversationId: string): void {
    refetch()
    setSelectedConversationId(conversationId)
  }

  function handleSelectMode(next: ChatMode): void {
    if (next === 'profile') {
      setReturnMode(mode)
    }
    setMode(next)
  }

  function handleLogout(): void {
    setSelectedConversationId(null)
    onLogout()
  }

  const displayConversations = conversations
    .filter((conversation) => conversation.type === 'user')
    .map((conversation) => ({
      ...conversation,
      title: deriveConversationTitle(conversation, currentUserId, getUserDisplayName),
    }))

  return (
    <ChatLayout
      mode={mode}
      currentUserId={currentUserId}
      status={status}
      conversations={displayConversations}
      error={error}
      selectedConversationId={selectedConversationId}
      onSelectMode={handleSelectMode}
      onLogout={handleLogout}
      onBack={() => setMode(returnMode)}
      onSelectConversation={setSelectedConversationId}
      onConversationCreated={handleConversationCreated}
      onConversationActivity={markConversationActivity}
    />
  )
}
