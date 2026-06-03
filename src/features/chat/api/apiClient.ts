import type {
  Conversation,
  GetMessagesResponse,
  LoginRequest,
  LoginResponse,
  SendMessageRequest,
  SendMessageResponse,
} from './chatApi.types'
import {
  mockGetConversations,
  mockGetMessages,
  mockLogin,
  mockLogout,
  mockPostMessage,
} from '../mocks/mockServer'

export async function getConversations(): Promise<Conversation[]> {
  return mockGetConversations()
}

export async function getMessages(
  conversationId: string,
  cursor?: string,
): Promise<GetMessagesResponse> {
  return mockGetMessages(conversationId, cursor)
}

export async function sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
  return mockPostMessage(request)
}

export async function login(request: LoginRequest): Promise<LoginResponse> {
  return mockLogin(request)
}

export async function logout(): Promise<void> {
  return mockLogout()
}
