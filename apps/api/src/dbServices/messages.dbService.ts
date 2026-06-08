import { randomUUID } from 'node:crypto'
import type { Message } from '@chat/contract'
import { listMessages, setMessage } from '../db/messages.store'

export type MessageDraft = Omit<Message, 'id'>

export function listByConversationId(conversationId: string): Message[] {
  return listMessages().filter((message) => {
    return message.conversationId === conversationId
  })
}

export function create(draft: MessageDraft): Message {
  const message: Message = { id: randomUUID(), ...draft }
  setMessage(message)
  return message
}
