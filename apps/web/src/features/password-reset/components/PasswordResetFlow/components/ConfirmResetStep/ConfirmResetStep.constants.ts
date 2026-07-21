import { RESET_CODE_LENGTH } from '@chat/contract'

export const CONFIRM_TITLE = 'Reset password'

// Built from RESET_CODE_LENGTH so the copy can never disagree with the real code.
export const CONFIRM_SUBTITLE = `If an account with that email exists, we sent a ${RESET_CODE_LENGTH}-digit code. Enter it below with a new password.`
