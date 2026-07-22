import type { ReactNode } from 'react'
import { ConfirmResetStepContainer } from './components/ConfirmResetStep/ConfirmResetStepContainer'
import { RequestCodeStepContainer } from './components/RequestCodeStep/RequestCodeStepContainer'
import { usePasswordResetFlowContext } from './PasswordResetFlow.context'

export function PasswordResetFlow() {
  const { step, email, onSent, onAlreadyHaveCode, onBackToRequest, onExit } =
    usePasswordResetFlowContext()

  let content: ReactNode
  if (step === 'request') {
    content = (
      <RequestCodeStepContainer
        onSent={onSent}
        onAlreadyHaveCode={onAlreadyHaveCode}
        onSwitchToLogin={onExit}
      />
    )
  } else {
    content = (
      <ConfirmResetStepContainer email={email} onBack={onBackToRequest} onSuccess={onExit} />
    )
  }

  return content
}
