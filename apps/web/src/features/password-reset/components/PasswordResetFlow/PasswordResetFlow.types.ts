import type { usePasswordResetFlow } from './hooks/usePasswordResetFlow'

export type PasswordResetFlowContextValue = ReturnType<typeof usePasswordResetFlow> & {
  onExit: () => void
}

export type PasswordResetFlowContainerProps = {
  onExit: () => void
}
