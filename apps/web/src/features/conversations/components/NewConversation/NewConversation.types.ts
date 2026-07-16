import type { User } from '@chat/contract'

export type NewConversationProps = {
  currentUserId: string
  onCreated: (conversationId: string) => void
}

export type NewConversationViewProps = {
  isOpen: boolean
  others: User[]
  selectedUserId: string
  errorMessage: string | null
  isBusy: boolean
  onOpen: () => void
  onSelect: (userId: string) => void
  onCreate: () => void
  onCancel: () => void
}

export type NewConversationFormProps = Omit<NewConversationViewProps, 'isOpen' | 'onOpen'>
