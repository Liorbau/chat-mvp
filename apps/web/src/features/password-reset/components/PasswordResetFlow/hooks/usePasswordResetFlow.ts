import { useState } from 'react'

type PasswordResetStep = 'request' | 'confirm'

type UsePasswordResetFlow = {
  step: PasswordResetStep
  email: string
  onSent: (email: string) => void
  onAlreadyHaveCode: () => void
  onBackToRequest: () => void
}

export function usePasswordResetFlow(): UsePasswordResetFlow {
  const [step, setStep] = useState<PasswordResetStep>('request')
  const [email, setEmail] = useState('')

  function onSent(sentEmail: string): void {
    setEmail(sentEmail)
    setStep('confirm')
  }

  function onAlreadyHaveCode(): void {
    setStep('confirm')
  }

  function onBackToRequest(): void {
    setStep('request')
  }

  return { step, email, onSent, onAlreadyHaveCode, onBackToRequest }
}
