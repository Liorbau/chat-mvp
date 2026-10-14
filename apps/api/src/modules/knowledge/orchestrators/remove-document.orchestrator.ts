import { Injectable } from '@nestjs/common'
import { KnowledgeService } from '../knowledge.service'

@Injectable()
export class RemoveDocumentOrchestrator {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  async execute(userId: string, id: string): Promise<{ id: string }> {
    await this.knowledgeService.assertOwner(id, userId)
    const removedId = await this.knowledgeService.removeDocument(id)
    return { id: removedId }
  }
}
