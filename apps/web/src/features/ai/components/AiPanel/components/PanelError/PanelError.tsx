import { useComposerContext } from '@/features/ai/context/composer.context'
import { ERROR_STYLE } from './PanelError.styles'

export function PanelError() {
  const { error, conversationType } = useComposerContext()
  return error == null ? null : (
    <div className={ERROR_STYLE[conversationType]} role="alert">
      {error}
    </div>
  )
}
