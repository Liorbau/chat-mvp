import { CURRENT_PLAN_PREFIX } from '../../PlanSection.constants'
import { usePlanContext } from '../../PlanSection.context'
import { CURRENT_PLAN_NAME_STYLE, CURRENT_PLAN_STYLE } from '../../PlanSection.styles'

export function CurrentPlan() {
  const { currentPlanName } = usePlanContext()

  return (
    <p className={CURRENT_PLAN_STYLE}>
      {CURRENT_PLAN_PREFIX} <span className={CURRENT_PLAN_NAME_STYLE}>{currentPlanName}</span>
    </p>
  )
}
