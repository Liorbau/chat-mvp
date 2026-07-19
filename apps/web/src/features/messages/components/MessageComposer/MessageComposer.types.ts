export type MessageComposerProps = {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}
