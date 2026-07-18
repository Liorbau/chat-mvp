import { ComposerContext } from '@/features/ai/context/composer.context'
import { useComposer } from '@/features/ai/hooks/useComposer'
import { TutorPanel } from './TutorPanel'
import type { TutorPanelProps } from './TutorPanel.types'

export function TutorPanelContainer({ currentUserId }: TutorPanelProps) {
  const value = useComposer(currentUserId, 'tutor')

  return (
    <ComposerContext.Provider value={value}>
      <TutorPanel />
    </ComposerContext.Provider>
  )
}
