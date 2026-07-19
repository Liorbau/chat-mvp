import { UPLOAD_LABEL_CHANGE, UPLOAD_LABEL_NEW } from './UploadButton.constants'

export function uploadButtonLabel(hasAvatar: boolean): string {
  return hasAvatar ? UPLOAD_LABEL_CHANGE : UPLOAD_LABEL_NEW
}
