import { RequestResetContext } from './RequestCodeStep.context'
import { RequestCodeStep } from './RequestCodeStep'
import type { RequestCodeStepContainerProps } from './RequestCodeStep.types'
import { useRequestReset } from './hooks/useRequestReset'

export function RequestCodeStepContainer({
  onSent,
  onAlreadyHaveCode,
  onSwitchToLogin,
}: RequestCodeStepContainerProps) {
  const state = useRequestReset(onSent)

  return (
    <RequestResetContext.Provider value={{ ...state, onAlreadyHaveCode, onSwitchToLogin }}>
      <RequestCodeStep />
    </RequestResetContext.Provider>
  )
}
