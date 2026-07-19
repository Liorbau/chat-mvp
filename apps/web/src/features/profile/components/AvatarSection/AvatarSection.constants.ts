export const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/webp']
export const AVATAR_ACCEPT = ALLOWED_AVATAR_TYPES.join(',')
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024

export const AVATAR_TOO_LARGE_MESSAGE = 'Image is too large. Please choose a file under 5 MB.'
export const AVATAR_TYPE_MESSAGE = 'Unsupported file type. Use PNG, JPEG, or WEBP.'

export const SECTION_STYLE = 'mt-2 flex items-center gap-4'
export const ACTIONS_STYLE = 'flex flex-col gap-2'
export const BUTTON_ROW_STYLE = 'flex gap-2'

export const DROPZONE_STYLE =
  'flex flex-col items-center gap-2 p-3 rounded-[12px] border-2 border-dashed border-[#cbd5e1] bg-white cursor-pointer disabled:cursor-not-allowed'
export const DROPZONE_ACTIVE_STYLE = 'border-[#2563eb] bg-[#eff6ff]'
export const DROPZONE_HINT_STYLE = 'text-[12px] text-[#64748b]'

export const UPLOAD_BUTTON_STYLE =
  'h-9 px-3 rounded-[10px] border-0 bg-[#2563eb] text-white text-[14px] font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'

export const REMOVE_BUTTON_STYLE =
  'h-9 px-3 rounded-[10px] border border-[#dbe3ee] bg-white text-[#334155] text-[14px] font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'

export const ERROR_STYLE = 'text-[#b91c1c] text-[13px]'
