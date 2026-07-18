import { Injectable, type PipeTransform } from '@nestjs/common'
import { AppError } from '../../errors/AppError'
import type { AvatarUpload } from './avatar.service'

@Injectable()
export class AvatarFilePipe implements PipeTransform<
  Express.Multer.File | undefined,
  AvatarUpload
> {
  transform(file: Express.Multer.File | undefined): AvatarUpload {
    if (file === undefined) {
      throw AppError.badRequest('VALIDATION_ERROR', 'No file uploaded (form field "file").')
    }
    return { buffer: file.buffer, mimeType: file.mimetype, size: file.size }
  }
}
