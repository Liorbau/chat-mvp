import { RESET_CODE_LENGTH } from '@chat/contract'
import { AuthErrorList } from '@/features/auth/components/AuthErrorList/AuthErrorList'
import { AuthField } from '@/features/auth/components/AuthField/AuthField'
import { AuthHint } from '@/features/auth/components/AuthHint/AuthHint'
import { AuthSubmitButton } from '@/features/auth/components/AuthSubmitButton/AuthSubmitButton'
import { useConfirmResetContext } from '../../ConfirmResetStep.context'
import {
  CODE_LABEL,
  EMAIL_LABEL,
  MIN_PASSWORD_LENGTH,
  NEW_PASSWORD_LABEL,
  PASSWORD_HINT,
  SUBMIT_BUSY_LABEL,
  SUBMIT_IDLE_LABEL,
} from './ConfirmForm.constants'

export function ConfirmForm() {
  const {
    email,
    code,
    newPassword,
    onEmailChange,
    onCodeChange,
    onNewPasswordChange,
    submitting,
    errors,
    submit,
  } = useConfirmResetContext()

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
      <AuthField
        label={CODE_LABEL}
        type="text"
        value={code}
        autoComplete="one-time-code"
        maxLength={RESET_CODE_LENGTH}
        minLength={RESET_CODE_LENGTH}
        onChange={onCodeChange}
      />
      <AuthField
        label={NEW_PASSWORD_LABEL}
        type="password"
        value={newPassword}
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        onChange={onNewPasswordChange}
      />
      <AuthHint>{PASSWORD_HINT}</AuthHint>
      <AuthErrorList errors={errors} />
      <AuthSubmitButton
        submitting={submitting}
        idleLabel={SUBMIT_IDLE_LABEL}
        busyLabel={SUBMIT_BUSY_LABEL}
      />
    </form>
  )
}
