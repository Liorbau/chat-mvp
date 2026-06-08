import type { Message } from '@chat/contract'

const messages = new Map<string, Message>()

export function listMessages(): Message[] {
  return [...messages.values()]
}

export function setMessage(message: Message): void {
  messages.set(message.id, message)
}

export function clearMessages(): void {
  messages.clear()
}
