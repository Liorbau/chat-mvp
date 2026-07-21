import type { usePasswordResetFlow } from './hooks/usePasswordResetFlow'

export type PasswordResetFlowView = ReturnType<typeof usePasswordResetFlow> & {
  onExit: () => void
}

export type PasswordResetFlowContainerProps = {
  onExit: () => void
}
