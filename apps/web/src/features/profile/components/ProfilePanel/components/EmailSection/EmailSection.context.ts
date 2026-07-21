import { createContext, useContext } from 'react'
import type { EmailChangeContextValue } from './EmailSection.types'

export const EmailChangeContext = createContext<EmailChangeContextValue | null>(null)

export function useEmailChangeContext(): EmailChangeContextValue {
  const context = useContext(EmailChangeContext)
  if (context == null) {
    throw new Error('useEmailChangeContext must be used inside <EmailSectionContainer>')
  }
  return context
}
