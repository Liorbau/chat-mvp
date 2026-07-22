import { ConfirmResetStepContainer } from './components/ConfirmResetStep/ConfirmResetStepContainer'
import { RequestCodeStepContainer } from './components/RequestCodeStep/RequestCodeStepContainer'
import { usePasswordResetFlowContext } from './PasswordResetFlow.context'

export function PasswordResetFlow() {
  const { step, email, onSent, onAlreadyHaveCode, onBackToRequest, onExit } =
    usePasswordResetFlowContext()

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
