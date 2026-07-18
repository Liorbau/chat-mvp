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
import { JwtAuthGuard } from '../auth/jwt.auth.guard'
import { DocumentParamsDto } from './dto/document.params.dto'
import { DocumentFilePipe } from './document-file.pipe'
import type { UploadedDocument } from './knowledge.service'
import { IngestDocumentOrchestrator } from './ingest-document.orchestrator'
import { ListDocumentsOrchestrator } from './list-documents.orchestrator'
import { RemoveDocumentOrchestrator } from './remove-document.orchestrator'

const MAX_FILE_BYTES = 5 * 1024 * 1024

@Controller('knowledge/documents')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(
    private readonly ingestDocumentOrchestrator: IngestDocumentOrchestrator,
    private readonly listDocumentsOrchestrator: ListDocumentsOrchestrator,
    private readonly removeDocumentOrchestrator: RemoveDocumentOrchestrator,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_FILE_BYTES } }),
  )
  async upload(
    @CurrentUser() user: User,
    @UploadedFile(DocumentFilePipe) file: UploadedDocument,
  ): Promise<KnowledgeDocument> {
    return this.ingestDocumentOrchestrator.execute(user.id, file)
  }

  @Get()
  async list(@CurrentUser() user: User): Promise<KnowledgeDocument[]> {
    return this.listDocumentsOrchestrator.execute(user.id)
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: User,
    @Param() params: DocumentParamsDto,
  ): Promise<{ id: string }> {
    return this.removeDocumentOrchestrator.execute(user.id, params.id)
  }
}
