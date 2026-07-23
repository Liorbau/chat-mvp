import type { ComposerProps } from './shared.types'

export function Composer({
  input,
  isStreaming,
  canSend,
  placeholderIdle,
  placeholderStreaming,
  styles,
  onInputChange,
  onSubmit,
}: ComposerProps) {
  return (
    <div className={styles.composer}>
      <textarea
        className={styles.textarea}
        value={input}
        rows={2}
        placeholder={isStreaming ? placeholderStreaming : placeholderIdle}
        onChange={(event) => {
          onInputChange(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            onSubmit()
          }
        }}
      />
      <button
        type="button"
        className={canSend ? styles.send : `${styles.send} ${styles.sendDisabled}`}
        disabled={!canSend}
        onClick={onSubmit}
      >
        Send
      </button>
    </div>
  )
}
