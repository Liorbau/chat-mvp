import { Injectable, type PipeTransform } from '@nestjs/common'
import { AppError } from '../../../errors/AppError'
import type { UploadedDocument } from '../knowledge.service'

export const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024

@Injectable()
export class DocumentFilePipe implements PipeTransform<
  Express.Multer.File | undefined,
  UploadedDocument
> {
  transform(file: Express.Multer.File | undefined): UploadedDocument {
    if (!file) {
      throw AppError.badRequest('No file uploaded (form field "file").')
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      throw AppError.badRequest('Document exceeds the 5 MB limit.')
    }
    return { name: file.originalname, mimeType: file.mimetype, buffer: file.buffer }
  }
}
