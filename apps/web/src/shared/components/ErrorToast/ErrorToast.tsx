import { TOAST_STYLE } from './ErrorToast.constants'
import type { ErrorToastProps } from './ErrorToast.types'

export function ErrorToast({ message }: ErrorToastProps) {
  return (
    <div role="alert" className={TOAST_STYLE}>
      <span>{message}</span>
    </div>
  )
}
