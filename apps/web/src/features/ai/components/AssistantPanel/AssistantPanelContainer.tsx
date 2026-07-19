import { ComposerContext } from '@/features/ai/context/composer.context'
import { useComposer } from '@/features/ai/hooks/useComposer'
import { AssistantPanel } from './AssistantPanel'
import type { AssistantPanelProps } from './AssistantPanel.types'

export function AssistantPanelContainer({ currentUserId }: AssistantPanelProps) {
  const value = useComposer(currentUserId, 'assistant')

  return (
    <ComposerContext.Provider value={value}>
      <AssistantPanel />
    </ComposerContext.Provider>
  )
}
