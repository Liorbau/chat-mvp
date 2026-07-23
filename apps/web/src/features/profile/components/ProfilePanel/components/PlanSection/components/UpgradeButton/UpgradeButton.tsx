import { submitButtonStyle } from '@/features/profile/components/ProfilePanel/ProfilePanel.styles'
import { usePlanContext } from '../../PlanSection.context'

export function UpgradeButton() {
  const { isPro, disabled, upgradeLabel, upgrade } = usePlanContext()

  return isPro ? null : (
    <button
      type="button"
      disabled={disabled}
      onClick={upgrade}
      className={submitButtonStyle(disabled)}
    >
      {upgradeLabel}
    </button>
  )
}
