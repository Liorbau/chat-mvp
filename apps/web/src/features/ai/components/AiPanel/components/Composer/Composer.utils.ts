import type { AiMode } from '@/features/ai/types/ai.types'
import { IDLE_PLACEHOLDER, STREAMING_PLACEHOLDER } from './Composer.constants'

export function composerPlaceholder(mode: AiMode, isStreaming: boolean): string {
  return isStreaming ? STREAMING_PLACEHOLDER[mode] : IDLE_PLACEHOLDER[mode]
}
