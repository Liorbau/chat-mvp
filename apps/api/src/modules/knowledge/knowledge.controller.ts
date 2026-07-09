import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { KnowledgeDocument, User } from '@chat/contract'
import { memoryStorage } from 'multer'
import { CurrentUser } from '../../common/decorators/current.user.decorator'
import { AppError } from '../../errors/AppError'
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { DocumentParamsDto } from './dto/document.params.dto'
import { KnowledgeService } from './knowledge.service'

const MAX_FILE_BYTES = 5 * 1024 * 1024

@Controller('knowledge/documents')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_FILE_BYTES } }),
  )
  async upload(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<KnowledgeDocument> {
    if (file === undefined) {
      throw AppError.badRequest('VALIDATION_ERROR', 'No file uploaded (form field "file").')
    }
    return this.knowledgeService.ingest(user.id, {
      name: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
    })
  }

  @Get()
  async list(@CurrentUser() user: User): Promise<KnowledgeDocument[]> {
    return this.knowledgeService.listDocuments(user.id)
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: User,
    @Param() params: DocumentParamsDto,
  ): Promise<{ id: string }> {
    const id = await this.knowledgeService.removeDocument(user.id, params.id)
    return { id }
  }
}
