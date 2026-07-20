import { STATUS_STYLE, STREAMING_BUBBLE_STYLE, STREAMING_ROW_STYLE } from './TutorPanel.styles'
import type { TutorStreamingBubbleProps } from './TutorPanel.types'

export function TutorStreamingBubble({ streamingText, toolLabel }: TutorStreamingBubbleProps) {
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
