import { Injectable, type PipeTransform } from '@nestjs/common'
import { AppError } from '../../errors/AppError'
import type { AvatarUpload } from './avatar.types'
import { detectImageMime } from './image.signature'

@Injectable()
export class AvatarFilePipe implements PipeTransform<
  Express.Multer.File | undefined,
  AvatarUpload
> {
  transform(file: Express.Multer.File | undefined): AvatarUpload {
    if (file === undefined) {
      throw AppError.badRequest('VALIDATION_ERROR', 'No file uploaded (form field "file").')
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
