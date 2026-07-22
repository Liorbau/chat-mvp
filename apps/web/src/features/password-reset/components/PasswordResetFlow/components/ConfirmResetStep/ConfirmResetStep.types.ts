import type { useConfirmReset } from './hooks/useConfirmReset'

export type ConfirmResetContextValue = ReturnType<typeof useConfirmReset> & {
  onBack: () => void
  onSuccess: () => void
}

export type ConfirmResetStepContainerProps = {
  email: string
  onBack: () => void
  onSuccess: () => void
}
