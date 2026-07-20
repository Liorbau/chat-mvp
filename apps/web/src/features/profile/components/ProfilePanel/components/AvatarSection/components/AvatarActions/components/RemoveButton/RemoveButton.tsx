import { useAvatarContext } from '../../../../AvatarSection.context'
import { REMOVE_BUTTON_STYLE } from './RemoveButton.styles'
import { REMOVE_BUTTON_LABEL } from './RemoveButton.constants'

export function RemoveButton() {
  const { hasAvatar, busy, onRemove } = useAvatarContext()
  if (!hasAvatar) {
    return null
  }

  return (
    <button type="button" className={REMOVE_BUTTON_STYLE} onClick={onRemove} disabled={busy}>
      {REMOVE_BUTTON_LABEL}
    </button>
  )
}
