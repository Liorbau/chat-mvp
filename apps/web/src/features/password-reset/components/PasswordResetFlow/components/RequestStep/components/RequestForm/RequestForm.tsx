import { AuthErrorList } from '@/features/auth/components/AuthErrorList/AuthErrorList'
import { AuthField } from '@/features/auth/components/AuthField/AuthField'
import { AuthSubmitButton } from '@/features/auth/components/AuthSubmitButton/AuthSubmitButton'
import { useRequestResetContext } from '../../RequestStep.context'
import { EMAIL_LABEL, SUBMIT_BUSY_LABEL, SUBMIT_IDLE_LABEL } from './RequestForm.constants'

export function RequestForm() {
  const { email, onEmailChange, submitting, errors, submit } = useRequestResetContext()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <AuthField
        label={EMAIL_LABEL}
        type="email"
        value={email}
        autoComplete="email"
        onChange={onEmailChange}
      />
      <AuthErrorList errors={errors} />
      <AuthSubmitButton
        submitting={submitting}
        idleLabel={SUBMIT_IDLE_LABEL}
        busyLabel={SUBMIT_BUSY_LABEL}
      />
    </form>
  )
}
