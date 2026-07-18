import type { DisplayConversation } from '@/features/conversations/types'
import type { LoadStatus } from '@/shared/state/chatStatus'
import type { ChatMode } from '@/features/app/components/ModeSwitcher/ModeSwitcher.types'

export type ChatLayoutProps = {
  currentUserId: string
  onLogout: () => void
}

export type ChatLayoutViewProps = {
  mode: ChatMode
  currentUserId: string
  status: LoadStatus
  conversations: DisplayConversation[]
  error: string | null
  selectedConversationId: string | null
  onSelectMode: (mode: ChatMode) => void
  onLogout: () => void
  onBack: () => void
  onSelectConversation: (id: string) => void
  onConversationCreated: (conversationId: string) => void
  onConversationActivity: (conversationId: string, lastMessagePreview: string) => void
}

export type ChatsViewProps = {
  currentUserId: string
  status: LoadStatus
  conversations: DisplayConversation[]
  error: string | null
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
  onConversationCreated: (conversationId: string) => void
  onConversationActivity: (conversationId: string, lastMessagePreview: string) => void
}

export type PersistentTopBarProps = {
  mode: ChatMode
  onSelectMode: (mode: ChatMode) => void
  onLogout: () => void
}

export type BackButtonProps = {
  onClick: () => void
}

export type ConversationsSidebarProps = {
  currentUserId: string
  status: LoadStatus
  conversations: DisplayConversation[]
  error: string | null
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
  onConversationCreated: (conversationId: string) => void
}

export type MessagesPaneProps = {
  currentUserId: string
  selectedConversationId: string | null
  onConversationActivity: (conversationId: string, lastMessagePreview: string) => void
}
