import { useAvatarContext } from '../../../../AvatarSection.context'
import { DROPZONE_HINT_STYLE } from './DropzoneHint.styles'
import { dropzoneHintLabel } from './DropzoneHint.utils'

export function DropzoneHint() {
  const { busy } = useAvatarContext()

  return <span className={DROPZONE_HINT_STYLE}>{dropzoneHintLabel(busy)}</span>
}
