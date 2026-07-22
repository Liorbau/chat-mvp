import { useConfirmResetContext } from '../../ConfirmResetStep.context'
import { ConfirmForm } from '../ConfirmForm/ConfirmForm'
import { SuccessState } from '../SuccessState/SuccessState'
import { BackButton } from './components/BackButton/BackButton'

export function ConfirmResetStepBody() {
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
