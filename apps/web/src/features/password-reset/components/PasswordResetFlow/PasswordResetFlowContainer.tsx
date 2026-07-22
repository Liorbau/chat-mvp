import { PasswordResetFlow } from './PasswordResetFlow'
import { PasswordResetFlowContext } from './PasswordResetFlow.context'
import type { PasswordResetFlowContainerProps } from './PasswordResetFlow.types'
import { usePasswordResetFlow } from './hooks/usePasswordResetFlow'

export function PasswordResetFlowContainer({ onExit }: PasswordResetFlowContainerProps) {
  const flow = usePasswordResetFlow()

  return (
    <PasswordResetFlowContext.Provider value={{ ...flow, onExit }}>
      <PasswordResetFlow />
    </PasswordResetFlowContext.Provider>
  )
}
