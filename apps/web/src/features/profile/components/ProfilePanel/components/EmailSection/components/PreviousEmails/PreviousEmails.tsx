import { useEmailChangeContext } from '../../EmailSection.context'
import {
  PREVIOUS_HEADING_STYLE,
  PREVIOUS_LIST_STYLE,
  PREVIOUS_WRAP_STYLE,
} from '../../EmailSection.styles'

export function PreviousEmails() {
  const { previousEmails } = useEmailChangeContext()

  return (
    <div className={PREVIOUS_WRAP_STYLE}>
      <p className={PREVIOUS_HEADING_STYLE}>Previous emails</p>
      <ul className={PREVIOUS_LIST_STYLE}>
        {previousEmails.map((email) => (
          <li key={email}>{email}</li>
        ))}
      </ul>
    </div>
  )
}
