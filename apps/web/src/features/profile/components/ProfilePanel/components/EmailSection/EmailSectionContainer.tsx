import { EmailChangeContext } from './EmailSection.context'
import { useEmailChange } from './hooks/useEmailChange'
import { EmailSection } from './EmailSection'

export function EmailSectionContainer() {
  const value = useEmailChange()

  return (
    <EmailChangeContext.Provider value={value}>
      <EmailSection />
    </EmailChangeContext.Provider>
  )
}
