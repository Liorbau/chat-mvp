import type { StreamingBubbleProps } from './shared.types'

export function StreamingBubble({ streamingText, toolLabel, styles }: StreamingBubbleProps) {
  return (
    <div className={styles.row}>
      <div className={styles.bubble}>
        {streamingText != null && streamingText.length > 0 ? (
          streamingText
        ) : (
          <span className={styles.status}>{toolLabel ?? 'Thinking…'}</span>
        )}
      </div>
    </div>
  )
}
