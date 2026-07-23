import {
  SECTION_HEADING_STYLE,
  SECTION_STYLE,
} from '@/features/profile/components/ProfilePanel/ProfilePanel.styles'
import { PLAN_SECTION_HEADING } from './PlanSection.constants'
import { CurrentPlan } from './components/CurrentPlan/CurrentPlan'
import { PlanErrors } from './components/PlanErrors/PlanErrors'
import { UpgradeButton } from './components/UpgradeButton/UpgradeButton'
import { UpgradeNotice } from './components/UpgradeNotice/UpgradeNotice'

export function PlanSection() {
  return (
    <section className={SECTION_STYLE}>
      <h2 className={SECTION_HEADING_STYLE}>{PLAN_SECTION_HEADING}</h2>
      <CurrentPlan />
      <UpgradeNotice />
      <UpgradeButton />
      <PlanErrors />
    </section>
  )
}
