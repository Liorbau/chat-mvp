import type { Citation, Message } from '@chat/contract'

export type TutorPanelProps = {
  currentUserId: string
}

export type TutorMessageProps = {
  message: Message
  currentUserId: string
}

export type TutorSourcesProps = {
  citations: Citation[]
}
