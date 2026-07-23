import { useAuth } from '@/features/auth/context/auth.context'
import { UPGRADE_TARGET_PLAN } from '../PlanSection.constants'
import { currentPlanName, isActivePro, priceLabel, upgradeButtonLabel } from '../PlanSection.utils'
import { usePlans } from './usePlans'
import { useUpgradeCheckout } from './useUpgradeCheckout'
import { useUpgradeReturn } from './useUpgradeReturn'

export function usePlan(): {
  currentPlanName: string
  isPro: boolean
  upgradeLabel: string
  disabled: boolean
  notice: string | null
  errors: string[]
  upgrade: () => void
} {
  const { user } = useAuth()
  const { plans, planErrors } = usePlans()
  const { upgrading, checkoutErrors, upgrade } = useUpgradeCheckout()
  const currentPlanKey = user?.subscription.planKey ?? 'free'
  const isPro = user != null && isActivePro(user)
  const { notice, returnErrors } = useUpgradeReturn(isPro)
  const price = priceLabel(plans.find((plan) => plan.key === UPGRADE_TARGET_PLAN))

  return {
    currentPlanName: currentPlanName(currentPlanKey, plans),
    isPro,
    upgradeLabel: upgradeButtonLabel(upgrading, price),
    disabled: upgrading || price == null,
    notice,
    errors: [...planErrors, ...checkoutErrors, ...returnErrors],
    upgrade,
  }
}
