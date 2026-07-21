import { ConfirmResetStepContainer } from './components/ConfirmResetStep/ConfirmResetStepContainer'
import { RequestCodeStepContainer } from './components/RequestCodeStep/RequestCodeStepContainer'
import type { PasswordResetFlowView } from './PasswordResetFlow.types'

export function PasswordResetFlow({
  step,
  email,
  onSent,
  onAlreadyHaveCode,
  onBackToRequest,
  onExit,
}: PasswordResetFlowView) {
  if (step === 'request') {
    return (
      <RequestCodeStepContainer
        onSent={onSent}
        onAlreadyHaveCode={onAlreadyHaveCode}
        onSwitchToLogin={onExit}
      />
    )
  }

  return <ConfirmResetStepContainer email={email} onBack={onBackToRequest} onSuccess={onExit} />
}
