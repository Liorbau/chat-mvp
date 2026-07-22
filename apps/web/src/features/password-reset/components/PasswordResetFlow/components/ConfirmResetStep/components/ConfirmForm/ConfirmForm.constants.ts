// Advisory UX minimum; the API DTO is the authority. Kept local because the
// same value also lives in signup — sharing it is a separate, wider change.
export const MIN_PASSWORD_LENGTH = 8

export const EMAIL_LABEL = 'Email'

export const CODE_LABEL = 'Reset code'

export const NEW_PASSWORD_LABEL = 'New password'

export const PASSWORD_HINT = `At least ${MIN_PASSWORD_LENGTH} characters.`

export const SUBMIT_IDLE_LABEL = 'Reset password'

export const SUBMIT_BUSY_LABEL = 'Resetting...'
