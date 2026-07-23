import { useEffect, useState } from 'react'
import type { Plan } from '@chat/contract'
import { toApiErrorMessages } from '@/shared/utils/apiErrorMessages'
import { getPlans } from '../apiActions/plans.api'

export function usePlans(): {
  plans: Plan[]
  planErrors: string[]
} {
  const [plans, setPlans] = useState<Plan[]>([])
  const [planErrors, setPlanErrors] = useState<string[]>([])

  useEffect(() => {
    void getPlans()
      .then((response) => setPlans(response.plans))
      .catch((error: unknown) => setPlanErrors(toApiErrorMessages(error)))
  }, [])

  return { plans, planErrors }
}
