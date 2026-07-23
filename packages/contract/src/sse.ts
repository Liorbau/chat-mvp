import type { Citation, Message } from './message'

export type AssistantSseEvent =
  | { type: 'user_message'; message: Message }
  | { type: 'token'; value: string }
  | { type: 'tool_call'; tool: string; label: string }
  | { type: 'tool_result'; tool: string }
  | { type: 'done'; messageId: string; citations?: Citation[] }
  | { type: 'error'; code: string; message: string }
