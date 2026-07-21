export const RESET_CODE_LENGTH = 6

export type RequestPasswordResetRequest = {
  email: string
}

export type RequestPasswordResetResponse = {
  status: 'reset_code_sent'
}

export type ConfirmPasswordResetRequest = {
  email: string
  code: string
  newPassword: string
}

export type ConfirmPasswordResetResponse = {
  status: 'password_reset'
}
