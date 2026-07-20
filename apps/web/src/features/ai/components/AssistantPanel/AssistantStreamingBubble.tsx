import { STATUS_STYLE, STREAMING_BUBBLE_STYLE, STREAMING_ROW_STYLE } from './AssistantPanel.styles'
import type { AssistantStreamingBubbleProps } from './AssistantPanel.types'

export function AssistantStreamingBubble({
  streamingText,
  toolLabel,
}: AssistantStreamingBubbleProps) {
  return (
    <div className={STREAMING_ROW_STYLE}>
      <div className={STREAMING_BUBBLE_STYLE}>
        {streamingText != null && streamingText.length > 0 ? (
          streamingText
        ) : (
          <span className={STATUS_STYLE}>{toolLabel ?? 'Thinking…'}</span>
        )}
      </div>
    </div>
  )
}
