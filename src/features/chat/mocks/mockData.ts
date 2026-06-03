import type { Conversation, Message, User } from '../api/chatApi.types'

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex',
    email: 'alex@example.com',
  },
  {
    id: 'user-2',
    name: 'Sam',
    email: 'sam@example.com',
  },
  {
    id: 'user-3',
    name: 'Dana',
    email: 'dana@example.com',
  },
  {
    id: 'user-4',
    name: 'Maya',
    email: 'maya@example.com',
  },
]

export function getMockUserDisplayName(userId: string): string {
  const matchedUser = mockUsers.find((user) => {
    return user.id === userId
  })

  return matchedUser?.name ?? userId
}

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Onboarding',
    participantIds: ['user-1', 'user-4'],
    lastMessagePreview: 'Welcome to the chat app!',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv-2',
    title: 'Product Feedback',
    participantIds: ['user-1', 'user-2'],
    lastMessagePreview: 'Can we improve empty states?',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'conv-3',
    title: 'Design Sync',
    participantIds: ['user-1', 'user-3'],
    lastMessagePreview: 'Let us review the chat layout.',
    updatedAt: new Date().toISOString(),
  },
]

export const mockMessages: Message[] = [
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
