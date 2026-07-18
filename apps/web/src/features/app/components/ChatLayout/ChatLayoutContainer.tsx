import { useState } from 'react'
import type { Conversation } from '@chat/contract'
import { useConversations } from '@/features/conversations/hooks/useConversations'
import type { DisplayConversation } from '@/features/conversations/types'
import { useUsers } from '@/features/user/context/user.context'
import { ChatLayout } from './ChatLayout'
import type { ChatLayoutProps } from './ChatLayout.types'
import type { ChatMode } from '@/features/app/components/ModeSwitcher/ModeSwitcher.types'

// Resolves the counterpart once: the derived title plus their avatar + name, so
// the list item stays a pure leaf.
function toDisplayConversation(
  conversation: Conversation,
  currentUserId: string,
  getUserDisplayName: (userId: string) => string,
  getUserAvatarUrl: (userId: string) => string | null,
): DisplayConversation {
  const otherIds = conversation.participantIds.filter((id) => id !== currentUserId)
  const otherId = otherIds.length === 1 ? otherIds[0] : undefined
  const fallback = conversation.title ?? 'Conversation'
  const name = otherId !== undefined ? getUserDisplayName(otherId) : fallback
  return {
    ...conversation,
    title: otherId !== undefined ? `Chat with ${name}` : fallback,
    avatarName: name,
    avatarUrl: otherId !== undefined ? getUserAvatarUrl(otherId) : null,
  }
}

export function ChatLayoutContainer({ currentUserId, onLogout }: ChatLayoutProps) {
  const { getUserDisplayName, getUserAvatarUrl } = useUsers()
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
    .map((conversation) =>
      toDisplayConversation(conversation, currentUserId, getUserDisplayName, getUserAvatarUrl),
    )

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
