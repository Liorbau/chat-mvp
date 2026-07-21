import { PasswordResetFlow } from './PasswordResetFlow'
import type { PasswordResetFlowContainerProps } from './PasswordResetFlow.types'
import { usePasswordResetFlow } from './hooks/usePasswordResetFlow'

export function PasswordResetFlowContainer({ onExit }: PasswordResetFlowContainerProps) {
  const flow = usePasswordResetFlow()

  return <PasswordResetFlow {...flow} onExit={onExit} />
}
