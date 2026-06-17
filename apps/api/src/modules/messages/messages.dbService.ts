import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import type { Message } from '@chat/contract'
import { listMessages, setMessage } from '../../db/messages.store'

export type MessageDraft = Omit<Message, 'id'>

@Injectable()
export class MessagesDbService {
  listByConversationId(conversationId: string): Message[] {
    return listMessages().filter((message) => {
      return message.conversationId === conversationId
    })
  }

  create(draft: MessageDraft): Message {
    const message: Message = { id: randomUUID(), ...draft }
    setMessage(message)
    return message
  }
}
