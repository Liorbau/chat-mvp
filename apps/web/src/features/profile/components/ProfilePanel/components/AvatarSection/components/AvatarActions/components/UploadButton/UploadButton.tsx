import { useAvatarContext } from '../../../../AvatarSection.context'
import { UPLOAD_BUTTON_STYLE } from './UploadButton.styles'
import { uploadButtonLabel } from './UploadButton.utils'

export function UploadButton() {
  const { hasAvatar, busy, onPickFile } = useAvatarContext()

  return (
    <button type="button" className={UPLOAD_BUTTON_STYLE} onClick={onPickFile} disabled={busy}>
      {uploadButtonLabel(hasAvatar)}
    </button>
  )
}
