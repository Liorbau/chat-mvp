import { Injectable, type PipeTransform } from '@nestjs/common'
import { AppError } from '../../errors/AppError'
import type { UploadedDocument } from './knowledge.service'

@Injectable()
export class DocumentFilePipe implements PipeTransform<
  Express.Multer.File | undefined,
  UploadedDocument
> {
  transform(file: Express.Multer.File | undefined): UploadedDocument {
    if (file === undefined) {
      throw AppError.badRequest('VALIDATION_ERROR', 'No file uploaded (form field "file").')
    }
    return { name: file.originalname, mimeType: file.mimetype, buffer: file.buffer }
  }
}
