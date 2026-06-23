import type { Message, User } from '@chat/contract'
import bcrypt from 'bcrypt'

// Shared password for hard-coded seed users. Single source of truth: tests
export const SEED_PASSWORD = 'password123'

export const SEED_USER_IDS = {
  alex: '11111111-1111-4111-8111-111111111111',
  sam: '22222222-2222-4222-8222-222222222222',
  dana: '33333333-3333-4333-8333-333333333333',
  maya: '44444444-4444-4444-8444-444444444444',
} as const

export const SEED_CONVERSATION_IDS = {
  onboarding: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  productFeedback: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  designSync: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
} as const

export function buildSeedUsers(bcryptRounds: number): (User & { passwordHash: string })[] {
  const seedPasswordHash = bcrypt.hashSync(SEED_PASSWORD, bcryptRounds)
  return [
    {
      id: SEED_USER_IDS.alex,
      name: 'Alex',
      email: 'alex@example.com',
      passwordHash: seedPasswordHash,
    },
    {
      id: SEED_USER_IDS.sam,
      name: 'Sam',
      email: 'sam@example.com',
      passwordHash: seedPasswordHash,
    },
    {
      id: SEED_USER_IDS.dana,
      name: 'Dana',
      email: 'dana@example.com',
      passwordHash: seedPasswordHash,
    },
    {
      id: SEED_USER_IDS.maya,
      name: 'Maya',
      email: 'maya@example.com',
      passwordHash: seedPasswordHash,
    },
  ]
}

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

// Message _id is generated as a uuid on insert, so seeds carry no id.
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
