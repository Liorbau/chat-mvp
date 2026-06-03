import type {
  Conversation,
  GetMessagesResponse,
  LoginRequest,
  LoginResponse,
  Message,
  SendMessageRequest,
  SendMessageResponse,
} from '../api/chatApi.types'
import { getSessionUserId, setSessionUserId } from '../auth/authSession'
import { mockConversations, mockMessages, mockUsers } from './mockData'

const MESSAGES_PAGE_SIZE = 2

function mockDelay(delayMilliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMilliseconds))
}

export async function mockGetConversations(): Promise<Conversation[]> {
  await mockDelay(400)
  const sessionUserId = getSessionUserId()
  const visibleConversations =
    sessionUserId === null
      ? mockConversations
      : mockConversations.filter((conversation) => {
          return conversation.participantIds.includes(sessionUserId)
        })

  return [...visibleConversations].sort((firstConversation, secondConversation) => {
    return secondConversation.updatedAt.localeCompare(firstConversation.updatedAt)
  })
}

export async function mockLogin(request: LoginRequest): Promise<LoginResponse> {
  await mockDelay(250)

  const normalizedIdentifier = request.email.trim().toLowerCase()
  const matchedUser = mockUsers.find((user) => {
    return user.email.toLowerCase() === normalizedIdentifier
  })
  if (matchedUser === undefined) {
    throw new Error('Invalid credentials')
  }

  setSessionUserId(matchedUser.id)

  return {
    token: `mock-token-${matchedUser.id}`,
    user: matchedUser,
  }
}

export async function mockLogout(): Promise<void> {
  await mockDelay(100)
  setSessionUserId(null)
}

export async function mockGetMessages(
  conversationId: string,
  cursor?: string,
): Promise<GetMessagesResponse> {
  await mockDelay(300)

  const conversationMessages: Message[] = mockMessages
    .filter((message) => {
      return message.conversationId === conversationId
    })
    .sort((firstMessage, secondMessage) => {
      return firstMessage.createdAt.localeCompare(secondMessage.createdAt)
    })

  if (conversationMessages.length === 0) {
    return {
      messages: [],
      nextCursor: null,
    }
  }

  const requestedCursorIndex = cursor === undefined ? conversationMessages.length : Number(cursor)
  const normalizedCursorIndex = Number.isNaN(requestedCursorIndex)
    ? conversationMessages.length
    : Math.min(Math.max(requestedCursorIndex, 0), conversationMessages.length)

  const pageStartIndex = Math.max(normalizedCursorIndex - MESSAGES_PAGE_SIZE, 0)
  const pagedMessages = conversationMessages.slice(pageStartIndex, normalizedCursorIndex)
  const nextCursor = pageStartIndex === 0 ? null : String(pageStartIndex)

  return {
    messages: pagedMessages,
    nextCursor,
  }
}

function shouldFailMessage(content: string) {
  return content.toLowerCase().includes('fail') || Math.random() < 0.2
}

export async function mockPostMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
  await mockDelay(350)

  const trimmedContent = request.content.trim()
  if (trimmedContent.length === 0) {
    throw new Error('Message content is required')
  }

  const hasConversation = mockConversations.some((conversation) => {
    return conversation.id === request.conversationId
  })
  if (!hasConversation) {
    throw new Error('Conversation not found')
  }

  if (shouldFailMessage(trimmedContent)) {
    throw new Error('Failed to send message')
  }

  const sessionUserId = getSessionUserId() ?? 'user-1'
  const createdMessage: Message = {
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    conversationId: request.conversationId,
    senderId: sessionUserId,
    content: trimmedContent,
    createdAt: new Date().toISOString(),
  }
  mockMessages.push(createdMessage)

  const conversationToUpdate = mockConversations.find((conversation) => {
    return conversation.id === request.conversationId
  })
  if (conversationToUpdate !== undefined) {
    conversationToUpdate.lastMessagePreview = trimmedContent
    conversationToUpdate.updatedAt = createdMessage.createdAt
  }

  return { message: createdMessage }
}
