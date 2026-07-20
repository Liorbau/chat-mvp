import { DropzoneContainer } from './components/Dropzone/DropzoneContainer'
import { AvatarActions } from './components/AvatarActions/AvatarActions'
import { FileInput } from './components/FileInput/FileInput'
import { SECTION_STYLE } from './AvatarSection.styles'

export function AvatarSection() {
  return (
    <div className={SECTION_STYLE}>
      <DropzoneContainer />
      <AvatarActions />
      <FileInput />
    </div>
  )
}
