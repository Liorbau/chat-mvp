import type { Message } from '@chat/contract'
import { SEED_CONVERSATION_IDS, SEED_USER_IDS } from './ids'

export const seedMessageDrafts: Omit<Message, 'id'>[] = [
  {
    conversationId: SEED_CONVERSATION_IDS.onboarding,
    senderId: SEED_USER_IDS.maya,
    content: 'Welcome to the chat app!',
    createdAt: '2026-05-27T08:00:00.000Z',
  },
  {
    conversationId: SEED_CONVERSATION_IDS.onboarding,
    senderId: SEED_USER_IDS.alex,
    content: 'Great, where should I start?',
    createdAt: '2026-05-27T08:01:00.000Z',
  },
  {
    conversationId: SEED_CONVERSATION_IDS.onboarding,
    senderId: SEED_USER_IDS.maya,
    content: 'Pick a conversation on the left and send your first message.',
    createdAt: '2026-05-27T08:02:00.000Z',
  },
  {
    conversationId: SEED_CONVERSATION_IDS.productFeedback,
    senderId: SEED_USER_IDS.alex,
    content: 'Can we improve empty states?',
    createdAt: '2026-05-27T09:00:00.000Z',
  },
  {
    conversationId: SEED_CONVERSATION_IDS.productFeedback,
    senderId: SEED_USER_IDS.sam,
    content: 'Yes, we can add clearer guidance text and a primary action.',
    createdAt: '2026-05-27T09:01:00.000Z',
  },
  {
    conversationId: SEED_CONVERSATION_IDS.productFeedback,
    senderId: SEED_USER_IDS.sam,
    content: 'Let us also include an icon for context.',
    createdAt: '2026-05-27T09:02:00.000Z',
  },
  {
    conversationId: SEED_CONVERSATION_IDS.designSync,
    senderId: SEED_USER_IDS.dana,
    content: 'Design sync starts in 10 minutes.',
    createdAt: '2026-05-27T10:00:00.000Z',
  },
  {
    conversationId: SEED_CONVERSATION_IDS.designSync,
    senderId: SEED_USER_IDS.dana,
    content: 'Perfect, I will share the latest layout proposal.',
    createdAt: '2026-05-27T10:01:00.000Z',
  },
  {
    conversationId: SEED_CONVERSATION_IDS.designSync,
    senderId: SEED_USER_IDS.alex,
    content: 'I will focus on spacing and accessibility feedback.',
    createdAt: '2026-05-27T10:02:00.000Z',
  },
]
