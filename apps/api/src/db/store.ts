import type { Conversation, Message } from '@chat/contract'
import bcrypt from 'bcrypt'
import { clearConversations, setConversation } from './conversations.store'
import { clearMessages, setMessage } from './messages.store'
import { clearUsers, setUser, type StoredUser } from './users.store'

// Shared password for hard-coded users
const SEED_PASSWORD = 'password123'

function buildSeedUsers(bcryptRounds: number): StoredUser[] {
  const seedPasswordHash = bcrypt.hashSync(SEED_PASSWORD, bcryptRounds)
  return [
    { id: 'user-1', name: 'Alex', email: 'alex@example.com', passwordHash: seedPasswordHash },
    { id: 'user-2', name: 'Sam', email: 'sam@example.com', passwordHash: seedPasswordHash },
    { id: 'user-3', name: 'Dana', email: 'dana@example.com', passwordHash: seedPasswordHash },
    { id: 'user-4', name: 'Maya', email: 'maya@example.com', passwordHash: seedPasswordHash },
  ]
}

const seedConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Onboarding',
    participantIds: ['user-1', 'user-4'],
    lastMessagePreview: 'Pick a conversation on the left and send your first message.',
    updatedAt: '2026-05-27T08:02:00.000Z',
  },
  {
    id: 'conv-2',
    title: 'Product Feedback',
    participantIds: ['user-1', 'user-2'],
    lastMessagePreview: 'Let us also include an icon for context.',
    updatedAt: '2026-05-27T09:02:00.000Z',
  },
  {
    id: 'conv-3',
    title: 'Design Sync',
    participantIds: ['user-1', 'user-3'],
    lastMessagePreview: 'I will focus on spacing and accessibility feedback.',
    updatedAt: '2026-05-27T10:02:00.000Z',
  },
]

const seedMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-4',
    content: 'Welcome to the chat app!',
    createdAt: '2026-05-27T08:00:00.000Z',
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-1',
    content: 'Great, where should I start?',
    createdAt: '2026-05-27T08:01:00.000Z',
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-4',
    content: 'Pick a conversation on the left and send your first message.',
    createdAt: '2026-05-27T08:02:00.000Z',
  },
  {
    id: 'msg-4',
    conversationId: 'conv-2',
    senderId: 'user-1',
    content: 'Can we improve empty states?',
    createdAt: '2026-05-27T09:00:00.000Z',
  },
  {
    id: 'msg-5',
    conversationId: 'conv-2',
    senderId: 'user-2',
    content: 'Yes, we can add clearer guidance text and a primary action.',
    createdAt: '2026-05-27T09:01:00.000Z',
  },
  {
    id: 'msg-6',
    conversationId: 'conv-2',
    senderId: 'user-2',
    content: 'Let us also include an icon for context.',
    createdAt: '2026-05-27T09:02:00.000Z',
  },
  {
    id: 'msg-7',
    conversationId: 'conv-3',
    senderId: 'user-3',
    content: 'Design sync starts in 10 minutes.',
    createdAt: '2026-05-27T10:00:00.000Z',
  },
  {
    id: 'msg-8',
    conversationId: 'conv-3',
    senderId: 'user-3',
    content: 'Perfect, I will share the latest layout proposal.',
    createdAt: '2026-05-27T10:01:00.000Z',
  },
  {
    id: 'msg-9',
    conversationId: 'conv-3',
    senderId: 'user-1',
    content: 'I will focus on spacing and accessibility feedback.',
    createdAt: '2026-05-27T10:02:00.000Z',
  },
]

// The bcrypt cost comes from the caller (bootstrap or tests) because seeding
// runs outside Nest's DI, where ConfigService is not available yet.
export function resetStore(bcryptRounds: number): void {
  clearUsers()
  clearConversations()
  clearMessages()

  for (const user of buildSeedUsers(bcryptRounds)) {
    setUser(user)
  }
  for (const conversation of seedConversations) {
    setConversation(conversation)
  }
  for (const message of seedMessages) {
    setMessage(message)
  }
}
