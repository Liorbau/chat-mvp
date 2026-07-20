import { useAvatarContext } from '../../AvatarSection.context'
import { AVATAR_ACCEPT } from './FileInput.constants'
import { FILE_INPUT_STYLE } from './FileInput.styles'

export function FileInput() {
  const { fileInputRef, onFileChange } = useAvatarContext()

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept={AVATAR_ACCEPT}
      onChange={onFileChange}
      className={FILE_INPUT_STYLE}
    />
  )
}
