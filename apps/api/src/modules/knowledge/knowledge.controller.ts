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
import { DocumentFilePipe } from './pipes/document-file.pipe'
import type { UploadedDocument } from './knowledge.service'
import { IngestDocumentOrchestrator } from './orchestrators/ingest-document.orchestrator'
import { ListDocumentsOrchestrator } from './orchestrators/list-documents.orchestrator'
import { RemoveDocumentOrchestrator } from './orchestrators/remove-document.orchestrator'

@Controller('knowledge/documents')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(
    private readonly ingestDocumentOrchestrator: IngestDocumentOrchestrator,
    private readonly listDocumentsOrchestrator: ListDocumentsOrchestrator,
    private readonly removeDocumentOrchestrator: RemoveDocumentOrchestrator,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
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
