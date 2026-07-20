import { Injectable, type PipeTransform } from '@nestjs/common'
import { AVATAR_MAX_BYTES, AVATAR_TOO_LARGE_MESSAGE, AVATAR_TYPE_MESSAGE } from '@chat/contract'
import { HttpAppError } from '../../../errors/HttpAppError'
import type { AvatarUpload } from '../lib/avatar.types'
import { detectImageMime } from '../lib/image.signature'

@Injectable()
export class AvatarFilePipe implements PipeTransform<
  Express.Multer.File | undefined,
  AvatarUpload
> {
  transform(file: Express.Multer.File | undefined): AvatarUpload {
    if (file === undefined) {
      throw HttpAppError.badRequest('No file uploaded (form field "file").')
    }
    if (file.size > AVATAR_MAX_BYTES) {
      throw HttpAppError.badRequest(AVATAR_TOO_LARGE_MESSAGE)
    }
    const mimeType = detectImageMime(file.buffer)
    if (mimeType == null) {
      throw HttpAppError.badRequest(AVATAR_TYPE_MESSAGE)
    }
    return { buffer: file.buffer, mimeType, size: file.size }
  }
}
