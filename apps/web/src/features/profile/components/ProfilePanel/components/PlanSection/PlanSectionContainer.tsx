import { PlanContext } from './PlanSection.context'
import { usePlan } from './hooks/usePlan'
import { PlanSection } from './PlanSection'

export function PlanSectionContainer() {
  const value = usePlan()

  return (
    <PlanContext.Provider value={value}>
      <PlanSection />
    </PlanContext.Provider>
  )
}
