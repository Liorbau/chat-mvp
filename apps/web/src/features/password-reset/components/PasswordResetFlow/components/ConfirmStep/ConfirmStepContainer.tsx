import { ConfirmResetContext } from './ConfirmStep.context'
import { ConfirmStep } from './ConfirmStep'
import type { ConfirmStepContainerProps } from './ConfirmStep.types'
import { useConfirmReset } from './hooks/useConfirmReset'

export function ConfirmStepContainer({ email, onBack, onSuccess }: ConfirmStepContainerProps) {
  const state = useConfirmReset(email)

  return (
    <ConfirmResetContext.Provider value={{ ...state, onBack, onSuccess }}>
      <ConfirmStep />
    </ConfirmResetContext.Provider>
  )
}
