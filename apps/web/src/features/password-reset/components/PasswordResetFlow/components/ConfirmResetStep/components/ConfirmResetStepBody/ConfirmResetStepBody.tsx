import { useConfirmResetContext } from '../../ConfirmResetStep.context'
import { ConfirmForm } from '../ConfirmForm/ConfirmForm'
import { SuccessState } from '../SuccessState/SuccessState'
import { BackButton } from './components/BackButton/BackButton'

export function ConfirmResetStepBody() {
  const { status } = useConfirmResetContext()

  return status === 'success' ? (
    <SuccessState />
  ) : (
    <>
      <ConfirmForm />
      <BackButton />
    </>
  )
}
