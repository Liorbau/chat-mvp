import type { Citation, Message } from '@chat/contract'

export type AssistantState = {
  conversationId: string | null
  messages: Message[]
  streamingText: string | null
  // Display label of the tool the agent is currently running (from the BE).
  toolLabel: string | null
  isStreaming: boolean
  error: string | null
}

export type AssistantAction =
  | { type: 'READY'; payload: { conversationId: string; messages: Message[] } }
  | { type: 'LOAD_ERROR'; payload: { error: string } }
  | { type: 'SEND_START'; payload: { optimistic: Message } }
  | { type: 'USER_MESSAGE'; payload: { tempId: string; message: Message } }
  | { type: 'TOOL_CALL'; payload: { label: string } }
  | { type: 'TOKEN'; payload: { value: string } }
  | {
      type: 'DONE'
      payload: { messageId: string; senderId: string; createdAt: string; citations?: Citation[] }
    }
  | { type: 'STREAM_ERROR'; payload: { error: string; tempId?: string } }
  | { type: 'STREAM_END' }

export const initialAssistantState: AssistantState = {
  conversationId: null,
  messages: [],
  streamingText: null,
  toolLabel: null,
  isStreaming: false,
  error: null,
}

export function assistantChatReducer(
  state: AssistantState,
  action: AssistantAction,
): AssistantState {
  switch (action.type) {
    case 'READY':
      return {
        ...state,
        conversationId: action.payload.conversationId,
        messages: action.payload.messages,
      }
    case 'LOAD_ERROR':
      return { ...state, error: action.payload.error }
    case 'SEND_START':
      return {
        ...state,
        messages: [...state.messages, action.payload.optimistic],
        isStreaming: true,
        toolLabel: null,
        streamingText: '',
        error: null,
      }
    case 'USER_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.payload.tempId ? action.payload.message : message,
        ),
      }
    case 'TOOL_CALL':
      return { ...state, toolLabel: action.payload.label }
    case 'TOKEN':
      return { ...state, streamingText: (state.streamingText ?? '') + action.payload.value }
    case 'DONE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: action.payload.messageId,
            conversationId: state.conversationId ?? '',
            senderId: action.payload.senderId,
            content: state.streamingText ?? '',
            createdAt: action.payload.createdAt,
            ...(action.payload.citations === undefined
              ? {}
              : { citations: action.payload.citations }),
          },
        ],
        streamingText: null,
        isStreaming: false,
        toolLabel: null,
      }
    case 'STREAM_ERROR':
      return {
        ...state,
        error: action.payload.error,
        messages:
          action.payload.tempId === undefined
            ? state.messages
            : state.messages.filter((message) => message.id !== action.payload.tempId),
      }
    case 'STREAM_END':
      return { ...state, isStreaming: false, streamingText: null, toolLabel: null }
    default:
      return state
  }
}
