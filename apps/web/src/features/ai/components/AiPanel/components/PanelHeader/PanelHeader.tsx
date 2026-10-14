import { AI_NAME } from '@/features/ai/constants/ai.constants'
import { useComposerContext } from '@/features/ai/context/composer.context'
import { PANEL_AVATAR } from './PanelHeader.constants'
import { AVATAR_STYLE, HEADER_STYLE, HEADER_TITLE_STYLE } from './PanelHeader.styles'

export function PanelHeader() {
  const { conversationType } = useComposerContext()

  return (
    <header className={HEADER_STYLE[conversationType]}>
      <div className={AVATAR_STYLE[conversationType]}>{PANEL_AVATAR[conversationType]}</div>
      <strong className={HEADER_TITLE_STYLE}>{AI_NAME[conversationType]}</strong>
    </header>
  )
}
