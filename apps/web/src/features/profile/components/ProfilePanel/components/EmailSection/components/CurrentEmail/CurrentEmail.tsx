import { useEmailChangeContext } from '../../EmailSection.context'
import { CURRENT_EMAIL_STYLE } from '../../EmailSection.styles'

export function CurrentEmail() {
  const { currentEmail } = useEmailChangeContext()

  return <p className={CURRENT_EMAIL_STYLE}>Current: {currentEmail}</p>
}
