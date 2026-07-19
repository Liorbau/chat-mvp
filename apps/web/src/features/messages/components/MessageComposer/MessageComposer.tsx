import { useEffect, useRef, useState } from 'react'
import {
  COMPOSER_CONTAINER_STYLE,
  INPUT_WRAPPER_STYLE,
  SEND_BUTTON_DISABLED_STYLE,
  SEND_BUTTON_STYLE,
  TEXTAREA_STYLE,
} from './MessageComposer.constants'
import type { MessageComposerProps } from './MessageComposer.types'

export function MessageComposer({ onSend, disabled = false }: MessageComposerProps) {
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const textAreaReference = useRef<HTMLTextAreaElement | null>(null)
  const shouldRefocusAfterSendRef = useRef(false)

  useEffect(() => {
    // Refocus only once the textarea is enabled again (isSending back to
    // false). Calling focus() while it is still disabled is a no-op, which is
    // why focus was lost after sending.
    if (!isSending && !disabled && shouldRefocusAfterSendRef.current) {
      shouldRefocusAfterSendRef.current = false
      textAreaReference.current?.focus()
    }
  }, [isSending, disabled])

  async function submitMessage() {
    const content = inputValue.trim()
    if (content.length === 0 || disabled || isSending) {
      return
    }

    setIsSending(true)
    try {
      await onSend(content)
      setInputValue('')
    } catch {
      // Keep current input so the user can edit and retry quickly.
    } finally {
      shouldRefocusAfterSendRef.current = true
      setIsSending(false)
    }
  }

  return (
    <div className={COMPOSER_CONTAINER_STYLE}>
      <div className={INPUT_WRAPPER_STYLE}>
        <textarea
          ref={textAreaReference}
          className={TEXTAREA_STYLE}
          value={inputValue}
          disabled={disabled || isSending}
          rows={3}
          placeholder="Type a message..."
          onChange={(event) => {
            setInputValue(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              void submitMessage()
            }
          }}
        />
        <button
          type="button"
          className={
            disabled || isSending || inputValue.trim().length === 0
              ? `${SEND_BUTTON_STYLE} ${SEND_BUTTON_DISABLED_STYLE}`
              : SEND_BUTTON_STYLE
          }
          disabled={disabled || isSending || inputValue.trim().length === 0}
          onMouseDown={(event) => {
            // Keep focus in textarea after clicking send.
            event.preventDefault()
          }}
          onClick={() => {
            void submitMessage()
          }}
          aria-label="Send message"
        >
          {isSending ? '...' : '⏎'}
        </button>
      </div>
    </div>
  )
}
