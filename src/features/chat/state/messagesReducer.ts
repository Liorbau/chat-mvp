import type { Message } from '../api/chatApi.types'

export type MessagesState = {
  messages: Message[]
  pendingMessages: Message[]
  error: string | null
}

export type MessagesAction =
  | { type: 'RESET' }
  | { type: 'LOAD_SUCCESS'; payload: { messages: Message[] } }
  | { type: 'SEND_START'; payload: { message: Message } }
  | { type: 'SEND_SUCCESS'; payload: { tempId: Message['id']; message: Message } }
  | { type: 'SEND_FAILURE'; payload: { tempId: Message['id']; error: string } }

export type MessagesDispatch = (action: MessagesAction) => void

export const initialMessagesState: MessagesState = {
  messages: [],
  pendingMessages: [],
  error: null,
}

export function messagesReducer(state: MessagesState, action: MessagesAction): MessagesState {
  if (action.type === 'RESET') {
    return initialMessagesState
  }

  if (action.type === 'LOAD_SUCCESS') {
    // Preserve pendingMessages: a reload can happen while a send is still in
    // flight. Pending messages are only removed on SEND_SUCCESS/SEND_FAILURE.
    return {
      ...state,
      messages: action.payload.messages,
      error: null,
    }
  }

  if (action.type === 'SEND_START') {
    return {
      ...state,
      pendingMessages: [...state.pendingMessages, action.payload.message],
      error: null,
    }
  }

  if (action.type === 'SEND_SUCCESS') {
    const nextPendingMessages = state.pendingMessages.filter((message) => {
      return message.id !== action.payload.tempId
    })

    return {
      ...state,
      messages: [...state.messages, action.payload.message].sort((firstMessage, secondMessage) => {
        return firstMessage.createdAt.localeCompare(secondMessage.createdAt)
      }),
      pendingMessages: nextPendingMessages,
      error: null,
    }
  }

  if (action.type === 'SEND_FAILURE') {
    return {
      ...state,
      pendingMessages: state.pendingMessages.filter((message) => {
        return message.id !== action.payload.tempId
      }),
      error: action.payload.error,
    }
  }

  return state
}
