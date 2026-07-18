import type { User } from '@chat/contract'

export type NewConversationProps = {
  currentUserId: string
  onCreated: (conversationId: string) => void
}

export type NewConversationValue = {
  isOpen: boolean
  others: User[]
  selectedUserId: string
  errorMessage: string | null
  isBusy: boolean
  open: () => void
  onSelect: (userId: string) => void
  create: () => void
  cancel: () => void
}
