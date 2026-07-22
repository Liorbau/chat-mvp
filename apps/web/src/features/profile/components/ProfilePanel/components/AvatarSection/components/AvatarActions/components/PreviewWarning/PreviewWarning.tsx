import { useAvatarContext } from '../../../../AvatarSection.context'
import { PREVIEW_WARNING_STYLE } from './PreviewWarning.styles'
import { AVATAR_PREVIEW_ERROR_MESSAGE } from './PreviewWarning.constants'

export function PreviewWarning() {
  const { previewFailed } = useAvatarContext()
  return previewFailed ? (
    <p className={PREVIEW_WARNING_STYLE}>{AVATAR_PREVIEW_ERROR_MESSAGE}</p>
  ) : null
}
