import { SAVED_NOTE_STYLE } from './ProfilePanel.constants'

export function SavedNote({ show }: { show: boolean }) {
  if (!show) {
    return null
  }
  return <p className={SAVED_NOTE_STYLE}>Saved.</p>
}
