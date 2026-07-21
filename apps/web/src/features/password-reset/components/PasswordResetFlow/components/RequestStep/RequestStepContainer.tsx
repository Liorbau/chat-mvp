import { RequestResetContext } from './RequestStep.context'
import { RequestStep } from './RequestStep'
import type { RequestStepContainerProps } from './RequestStep.types'
import { useRequestReset } from './hooks/useRequestReset'

export function RequestStepContainer({
  onSent,
  onAlreadyHaveCode,
  onSwitchToLogin,
}: RequestStepContainerProps) {
  const state = useRequestReset(onSent)

  return (
    <RequestResetContext.Provider value={{ ...state, onAlreadyHaveCode, onSwitchToLogin }}>
      <RequestStep />
    </RequestResetContext.Provider>
  )
}
