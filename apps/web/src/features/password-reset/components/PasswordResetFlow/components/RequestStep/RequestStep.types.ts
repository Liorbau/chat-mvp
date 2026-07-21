import type { useRequestReset } from './hooks/useRequestReset'

export type RequestResetContextValue = ReturnType<typeof useRequestReset> & {
  onAlreadyHaveCode: () => void
  onSwitchToLogin: () => void
}

export type RequestStepContainerProps = {
  onSent: (email: string) => void
  onAlreadyHaveCode: () => void
  onSwitchToLogin: () => void
}
