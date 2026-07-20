import { ERROR_LIST_STYLE } from './ProfilePanel.styles'
import type { ErrorListProps } from './ProfilePanel.types'

export function ErrorList({ messages }: ErrorListProps) {
  return messages.length === 0 ? null : (
    <ul role="alert" className={ERROR_LIST_STYLE}>
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  )
}
