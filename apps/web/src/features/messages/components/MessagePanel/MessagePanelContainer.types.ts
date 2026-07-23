export type MessagePanelContainerProps = {
  selectedConversationId: string | null
  currentUserId: string
  onConversationActivity: (conversationId: string, lastMessagePreview: string) => void
}
