import { ConfirmStepContainer } from './components/ConfirmStep/ConfirmStepContainer'
import { RequestStepContainer } from './components/RequestStep/RequestStepContainer'
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
      <RequestStepContainer
        onSent={onSent}
        onAlreadyHaveCode={onAlreadyHaveCode}
        onSwitchToLogin={onExit}
      />
    )
  }

  return <ConfirmStepContainer email={email} onBack={onBackToRequest} onSuccess={onExit} />
}
