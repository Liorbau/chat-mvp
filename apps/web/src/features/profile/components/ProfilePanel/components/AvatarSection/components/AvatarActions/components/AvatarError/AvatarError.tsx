import { useAvatarContext } from '../../../../AvatarSection.context'
import { ERROR_STYLE } from './AvatarError.styles'

export function AvatarError() {
  const { error } = useAvatarContext()
  if (error === null) {
    return null
  }

  return <p className={ERROR_STYLE}>{error}</p>
}
