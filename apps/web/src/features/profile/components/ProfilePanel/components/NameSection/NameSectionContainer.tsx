import { useAuth } from '@/features/auth/context/auth.context'
import { NameSectionContext } from './NameSection.context'
import { useNameForm } from './hooks/useNameForm'
import { NameSection } from './NameSection'

export function NameSectionContainer() {
  const { user } = useAuth()
  const value = useNameForm(user)

  return (
    <NameSectionContext.Provider value={value}>
      <NameSection />
    </NameSectionContext.Provider>
  )
}
