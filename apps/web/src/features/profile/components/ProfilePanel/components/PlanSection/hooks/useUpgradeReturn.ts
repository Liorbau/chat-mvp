import { useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/context/auth.context'
import {
  clearUpgradeReturnFromUrl,
  readUpgradeReturn,
  type UpgradeReturn,
} from '@/features/profile/utils/upgradeReturn'
import { toApiErrorMessages } from '@/shared/utils/apiErrorMessages'
import { POLL_ATTEMPTS, POLL_DELAY_MS } from '../PlanSection.constants'
import { delay, isActivePro, upgradeNotice } from '../PlanSection.utils'

export function useUpgradeReturn(isPro: boolean): {
  notice: string | null
  returnErrors: string[]
} {
  const { refreshUser } = useAuth()
  const [returnStatus] = useState<UpgradeReturn | null>(() => readUpgradeReturn())
  const [returnErrors, setReturnErrors] = useState<string[]>([])
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (returnStatus === 'cancelled') {
      clearUpgradeReturnFromUrl()
      return
    }
    if (returnStatus !== 'success') {
      return
    }

    let cancelled = false

    async function pollForPro(): Promise<boolean> {
      for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
        if (cancelled) {
          return false
        }
        const fresh = await refreshUser()
        if (isActivePro(fresh)) {
          clearUpgradeReturnFromUrl()
          return true
        }
        await delay(POLL_DELAY_MS)
      }
      clearUpgradeReturnFromUrl()
      return false
    }

    void pollForPro()
      .then((granted) => {
        if (!cancelled && !granted) {
          setTimedOut(true)
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setReturnErrors(toApiErrorMessages(error))
          clearUpgradeReturnFromUrl()
        }
      })

    return () => {
      cancelled = true
    }
  }, [returnStatus, refreshUser])

  return {
    notice: upgradeNotice(returnStatus, isPro, timedOut),
    returnErrors,
  }
}
