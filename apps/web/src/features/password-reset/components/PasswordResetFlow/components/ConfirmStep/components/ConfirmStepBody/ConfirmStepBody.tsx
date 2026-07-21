import { useConfirmResetContext } from '../../ConfirmStep.context'
import { ConfirmForm } from '../ConfirmForm/ConfirmForm'
import { SuccessState } from '../SuccessState/SuccessState'
import { BackButton } from './components/BackButton/BackButton'

export function ConfirmStepBody() {
  const { status } = useConfirmResetContext()

  if (status === 'success') {
    return <SuccessState />
  }

  return (
    <>
      <ConfirmForm />
      <BackButton />
    </>
  )
}
