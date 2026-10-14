import type { ComposerValue } from '@/features/ai/context/composer.types'

type ChatProgress = Pick<ComposerValue, 'messages' | 'streamingText' | 'isStreaming'>

export function isConversationEmpty({
  messages,
  streamingText,
  isStreaming,
}: ChatProgress): boolean {
  return messages.length === 0 && streamingText == null && !isStreaming
}
