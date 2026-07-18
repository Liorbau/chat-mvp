import { Injectable } from '@nestjs/common'
import type { KnowledgeDocument } from '@chat/contract'
import { KnowledgeService, type UploadedDocument } from './knowledge.service'

@Injectable()
export class IngestDocumentOrchestrator {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  execute(userId: string, file: UploadedDocument): Promise<KnowledgeDocument> {
    return this.knowledgeService.ingest(userId, file)
  }
}
