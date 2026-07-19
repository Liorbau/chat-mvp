import { Injectable } from '@nestjs/common'
import type { KnowledgeDocument } from '@chat/contract'
import { KnowledgeService } from '../knowledge.service'

@Injectable()
export class ListDocumentsOrchestrator {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  execute(userId: string): Promise<KnowledgeDocument[]> {
    return this.knowledgeService.listDocuments(userId)
  }
}
