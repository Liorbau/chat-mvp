import { SEED_CONVERSATION_IDS, SEED_USER_IDS } from './ids'

export type SeedConversation = {
  id: string
  title?: string
  participantIds: string[]
  lastMessagePreview: string
  lastMessageAt: Date
}

export const seedConversations: SeedConversation[] = [
  {
    id: SEED_CONVERSATION_IDS.onboarding,
    title: 'Onboarding',
    participantIds: [SEED_USER_IDS.alex, SEED_USER_IDS.maya],
    lastMessagePreview: 'Pick a conversation on the left and send your first message.',
    lastMessageAt: new Date('2026-05-27T08:02:00.000Z'),
  },
  {
    id: SEED_CONVERSATION_IDS.productFeedback,
    title: 'Product Feedback',
    participantIds: [SEED_USER_IDS.alex, SEED_USER_IDS.sam],
    lastMessagePreview: 'Let us also include an icon for context.',
    lastMessageAt: new Date('2026-05-27T09:02:00.000Z'),
  },
  {
    id: SEED_CONVERSATION_IDS.designSync,
    title: 'Design Sync',
    participantIds: [SEED_USER_IDS.alex, SEED_USER_IDS.dana],
    lastMessagePreview: 'I will focus on spacing and accessibility feedback.',
    lastMessageAt: new Date('2026-05-27T10:02:00.000Z'),
  },
]
