import { DROPZONE_HINT_BUSY, DROPZONE_HINT_IDLE } from './DropzoneHint.constants'

export function dropzoneHintLabel(busy: boolean): string {
  return busy ? DROPZONE_HINT_BUSY : DROPZONE_HINT_IDLE
}
