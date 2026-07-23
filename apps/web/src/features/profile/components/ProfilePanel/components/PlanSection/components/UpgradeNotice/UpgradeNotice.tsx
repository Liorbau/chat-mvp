import { usePlanContext } from '../../PlanSection.context'
import { NOTICE_STYLE } from '../../PlanSection.styles'

export function UpgradeNotice() {
  const { notice } = usePlanContext()

  return notice == null ? null : <p className={NOTICE_STYLE}>{notice}</p>
}
