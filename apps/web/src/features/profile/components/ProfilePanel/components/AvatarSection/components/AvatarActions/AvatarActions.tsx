import { UploadButton } from './components/UploadButton/UploadButton'
import { RemoveButton } from './components/RemoveButton/RemoveButton'
import { AvatarError } from './components/AvatarError/AvatarError'
import { PreviewWarning } from './components/PreviewWarning/PreviewWarning'
import { ACTIONS_STYLE, BUTTON_ROW_STYLE } from './AvatarActions.styles'

export function AvatarActions() {
  return (
    <div className={ACTIONS_STYLE}>
      <div className={BUTTON_ROW_STYLE}>
        <UploadButton />
        <RemoveButton />
      </div>
      <AvatarError />
      <PreviewWarning />
    </div>
  )
}
