import { useComposerContext } from '@/features/ai/context/composer.context'
import { STATUS_STYLE } from './StreamingContent.styles'
import { hasStreamedText, streamingStatus } from './StreamingContent.utils'

export function StreamingContent() {
  const { streamingText, toolLabel, conversationType } = useComposerContext()
  return hasStreamedText(streamingText) ? (
    streamingText
  ) : (
    <span className={STATUS_STYLE[conversationType]}>{streamingStatus(toolLabel)}</span>
  )
}
