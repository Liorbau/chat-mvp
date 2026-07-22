import { useAvatarContext } from '../../../../AvatarSection.context'
import { ERROR_STYLE } from './AvatarError.styles'

export function AvatarError() {
  const { error } = useAvatarContext()
  return error == null ? null : <p className={ERROR_STYLE}>{error}</p>
}
