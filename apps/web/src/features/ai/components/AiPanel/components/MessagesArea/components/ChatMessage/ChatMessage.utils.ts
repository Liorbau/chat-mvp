import { ASSISTANT_SENDER_ID, type Message } from '@chat/contract'
import { AI_NAME } from '@/features/ai/constants/ai.constants'
import type { AiMode } from '@/features/ai/types/ai.types'
import { OWN_SENDER_LABEL } from './ChatMessage.constants'

export function senderLabel(message: Message, currentUserId: string, mode: AiMode): string {
  if (message.senderId === ASSISTANT_SENDER_ID) {
    return AI_NAME[mode]
  }
  return message.senderId === currentUserId ? OWN_SENDER_LABEL : message.senderId
}
