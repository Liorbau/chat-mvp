const DROPZONE_STYLE =
  'flex flex-col items-center gap-2 p-3 rounded-[12px] border-2 border-dashed border-[#cbd5e1] bg-white cursor-pointer disabled:cursor-not-allowed'
const DROPZONE_ACTIVE_STYLE = 'border-[#2563eb] bg-[#eff6ff]'

export function dropzoneClass(isDragging: boolean): string {
  return isDragging ? `${DROPZONE_STYLE} ${DROPZONE_ACTIVE_STYLE}` : DROPZONE_STYLE
}
