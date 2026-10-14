import { useComposerContext } from '@/features/ai/context/composer.context'
import { STREAMING_BUBBLE_STYLE, STREAMING_ROW_STYLE } from './StreamingBubble.styles'
import { StreamingContent } from './components/StreamingContent/StreamingContent'

export function StreamingBubble() {
  const { isStreaming, conversationType } = useComposerContext()
  return isStreaming ? (
    <div className={STREAMING_ROW_STYLE}>
      <div className={STREAMING_BUBBLE_STYLE[conversationType]}>
        <StreamingContent />
      </div>
    </div>
  ) : null
}
