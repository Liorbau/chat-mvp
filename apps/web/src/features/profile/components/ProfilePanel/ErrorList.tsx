import { ERROR_LIST_STYLE } from './ProfilePanel.constants'

export function ErrorList({ messages }: { messages: string[] }) {
  if (messages.length === 0) {
    return null
  }
  return (
    <ul role="alert" className={ERROR_LIST_STYLE}>
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  )
}
