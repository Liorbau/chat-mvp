import { THINKING_LABEL } from './StreamingContent.constants'

export function hasStreamedText(streamingText: string | null): streamingText is string {
  return streamingText != null && streamingText.length > 0
}

export function streamingStatus(toolLabel: string | null): string {
  return toolLabel ?? THINKING_LABEL
}
