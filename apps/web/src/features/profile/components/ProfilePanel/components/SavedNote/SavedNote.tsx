import { SAVED_NOTE_STYLE } from './SavedNote.styles'
import type { SavedNoteProps } from './SavedNote.types'

export function SavedNote({ show }: SavedNoteProps) {
  return show ? <p className={SAVED_NOTE_STYLE}>Saved.</p> : null
}
