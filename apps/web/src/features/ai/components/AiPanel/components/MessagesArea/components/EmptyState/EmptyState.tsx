import { useComposerContext } from '@/features/ai/context/composer.context'
import { EMPTY_LABEL } from './EmptyState.constants'
import { EMPTY_STYLE } from './EmptyState.styles'
import { isConversationEmpty } from './EmptyState.utils'

export function EmptyState() {
  const chat = useComposerContext()
  return isConversationEmpty(chat) ? (
    <p className={EMPTY_STYLE}>{EMPTY_LABEL[chat.conversationType]}</p>
  ) : null
}
