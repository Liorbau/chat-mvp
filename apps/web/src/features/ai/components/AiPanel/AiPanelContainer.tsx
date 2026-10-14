import { ComposerContext } from '@/features/ai/context/composer.context'
import { useComposer } from '@/features/ai/hooks/useComposer'
import { AiPanel } from './AiPanel'
import type { AiPanelProps } from './AiPanel.types'

export function AiPanelContainer({ currentUserId, mode }: AiPanelProps) {
  const value = useComposer(currentUserId, mode)

  return (
    <ComposerContext.Provider value={value}>
      <AiPanel />
    </ComposerContext.Provider>
  )
}
