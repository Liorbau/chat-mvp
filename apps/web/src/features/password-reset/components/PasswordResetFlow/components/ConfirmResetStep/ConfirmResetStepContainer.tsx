import { ConfirmResetContext } from './ConfirmResetStep.context'
import { ConfirmResetStep } from './ConfirmResetStep'
import type { ConfirmResetStepContainerProps } from './ConfirmResetStep.types'
import { useConfirmReset } from './hooks/useConfirmReset'

export function ConfirmResetStepContainer({
  email,
  onBack,
  onSuccess,
}: ConfirmResetStepContainerProps) {
  const state = useConfirmReset(email)

  return (
    <ConfirmResetContext.Provider value={{ ...state, onBack, onSuccess }}>
      <ConfirmResetStep />
    </ConfirmResetContext.Provider>
  )
}
