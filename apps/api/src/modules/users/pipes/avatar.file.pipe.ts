import { Injectable, type PipeTransform } from '@nestjs/common'
import { AppError } from '../../../errors/AppError'
import { AVATAR_MAX_BYTES } from '../../storage/storage.constants'
import type { AvatarUpload } from '../lib/avatar.types'
import { detectImageMime } from '../lib/image.signature'

@Injectable()
export class AvatarFilePipe implements PipeTransform<
  Express.Multer.File | undefined,
  AvatarUpload
> {
  transform(file: Express.Multer.File | undefined): AvatarUpload {
    if (file === undefined) {
      throw AppError.badRequest('VALIDATION_ERROR', 'No file uploaded (form field "file").')
    }
    if (file.size > AVATAR_MAX_BYTES) {
      throw AppError.badRequest('VALIDATION_ERROR', 'Image exceeds the 5 MB limit.')
    }
    const mimeType = detectImageMime(file.buffer)
    if (mimeType === null) {
      throw AppError.badRequest(
        'VALIDATION_ERROR',
        'Unsupported image type (use PNG, JPEG, or WEBP)',
      )
    }
    return { buffer: file.buffer, mimeType, size: file.size }
  }
}
