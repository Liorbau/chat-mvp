import { useState } from 'react'
import { toApiErrorMessages } from '@/shared/utils/apiErrorMessages'
import { createPaymentSession } from '../apiActions/plans.api'
import { UPGRADE_TARGET_PLAN } from '../PlanSection.constants'

export function useUpgradeCheckout(): {
  upgrading: boolean
  checkoutErrors: string[]
  upgrade: () => void
} {
  const [upgrading, setUpgrading] = useState(false)
  const [checkoutErrors, setCheckoutErrors] = useState<string[]>([])

  function upgrade(): void {
    setUpgrading(true)
    setCheckoutErrors([])
    void createPaymentSession({ planKey: UPGRADE_TARGET_PLAN })
      .then(({ redirectUrl }) => window.location.assign(redirectUrl))
      .catch((error: unknown) => {
        setCheckoutErrors(toApiErrorMessages(error))
        setUpgrading(false)
      })
  }

  return { upgrading, checkoutErrors, upgrade }
}
