import { SAVED_NOTE_STYLE } from '@/features/profile/components/ProfilePanel/components/SavedNote/SavedNote.styles'
import { useEmailChangeContext } from '../../EmailSection.context'

export function ConfirmationNotice() {
  const { sentTo } = useEmailChangeContext()

  return (
    <p role="status" className={SAVED_NOTE_STYLE}>
      Confirmation sent to {sentTo}. Open the link in that email to finish the change.
    </p>
  )
}
