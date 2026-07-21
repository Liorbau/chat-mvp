export type ConfirmEmailStatus = 'pending' | 'success' | 'invalid'

export type ConfirmEmailContextValue = {
  status: ConfirmEmailStatus
  email: string | null
  error: string | null
  onDone: () => void
}

export type ConfirmEmailScreenContainerProps = {
  token: string
  onDone: () => void
}
