import { ErrorList } from '@/features/profile/components/ProfilePanel/components/ErrorList/ErrorList'
import { usePlanContext } from '../../PlanSection.context'

export function PlanErrors() {
  const { errors } = usePlanContext()

  return <ErrorList messages={errors} />
}
