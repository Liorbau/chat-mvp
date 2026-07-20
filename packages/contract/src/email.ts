// Contract for the confirmed email-change flow.

export type RequestEmailChangeRequest = {
  newEmail: string
}

export type RequestEmailChangeResponse = {
  status: 'confirmation_sent'
}

export type ConfirmEmailChangeRequest = {
  token: string
}
