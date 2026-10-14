import { useComposerContext } from '@/features/ai/context/composer.context'
import { PANEL_STYLE } from './AiPanel.styles'
import { Composer } from './components/Composer/Composer'
import { MessagesArea } from './components/MessagesArea/MessagesArea'
import { PanelError } from './components/PanelError/PanelError'
import { PanelHeader } from './components/PanelHeader/PanelHeader'
import { TutorDocuments } from './components/TutorDocuments/TutorDocuments'

export function AiPanel() {
  const { conversationType } = useComposerContext()

  return (
    <section className={PANEL_STYLE[conversationType]}>
      <PanelHeader />
      <TutorDocuments />
      <PanelError />
      <MessagesArea />
      <Composer />
    </section>
  )
}
