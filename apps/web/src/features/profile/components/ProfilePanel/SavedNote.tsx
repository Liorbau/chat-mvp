import { SAVED_NOTE_STYLE } from './ProfilePanel.constants'
import type { SavedNoteProps } from './ProfilePanel.types'

export function SavedNote({ show }: SavedNoteProps) {
  return show ? <p className={SAVED_NOTE_STYLE}>Saved.</p> : null
}
