import type { Plan, PlanKey, User } from '@chat/contract'
import type { UpgradeReturn } from '@/features/profile/utils/upgradeReturn'
import {
  UPGRADE_CANCELLED_MESSAGE,
  UPGRADE_PROCESSING_MESSAGE,
  UPGRADE_REDIRECTING_LABEL,
  UPGRADE_SUCCESS_MESSAGE,
  UPGRADE_TARGET_PLAN,
  UPGRADE_TIMEOUT_MESSAGE,
} from './PlanSection.constants'

export function isActivePro(user: User): boolean {
  return user.subscription.planKey === 'pro' && user.subscription.status === 'active'
}

export function delay(ms: number): Promise<number> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(ms), ms)
  })
}

export function currentPlanName(planKey: PlanKey, plans: Plan[]): string {
  const plan = plans.find((candidate) => candidate.key === planKey)
  return plan != null ? plan.name : capitalize(planKey)
}

export function priceLabel(plan: Plan | undefined): string | null {
  return plan == null
    ? null
    : new Intl.NumberFormat(undefined, { style: 'currency', currency: plan.currency }).format(
        plan.priceAmount / 100,
      )
}

export function upgradeButtonLabel(upgrading: boolean, price: string | null): string {
  if (upgrading) {
    return UPGRADE_REDIRECTING_LABEL
  }
  if (price == null) {
    return `Upgrade to ${capitalize(UPGRADE_TARGET_PLAN)}`
  }
  return `Upgrade to ${capitalize(UPGRADE_TARGET_PLAN)} — ${price}`
}

export function upgradeNotice(
  returnStatus: UpgradeReturn | null,
  isPro: boolean,
  timedOut = false,
): string | null {
  if (returnStatus === 'success') {
    if (isPro) {
      return UPGRADE_SUCCESS_MESSAGE
    }
    return timedOut ? UPGRADE_TIMEOUT_MESSAGE : UPGRADE_PROCESSING_MESSAGE
  }
  if (returnStatus === 'cancelled') {
    return UPGRADE_CANCELLED_MESSAGE
  }
  return null
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
