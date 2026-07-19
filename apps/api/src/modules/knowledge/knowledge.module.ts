import { Embeddings } from '@langchain/core/embeddings'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Chunk, ChunkSchema } from './schemas/chunk.schema'
import { KnowledgeDocument, KnowledgeDocumentSchema } from './schemas/document.schema'
import { ChunkDbService } from './repositories/chunk.dbService'
import { DocumentDbService } from './repositories/document.dbService'
import { KnowledgeController } from './knowledge.controller'
import { KnowledgeRetrieverService } from './knowledge.retriever.service'
import { KnowledgeService } from './knowledge.service'
import { IngestDocumentOrchestrator } from './orchestrators/ingest-document.orchestrator'
import { ListDocumentsOrchestrator } from './orchestrators/list-documents.orchestrator'
import { RemoveDocumentOrchestrator } from './orchestrators/remove-document.orchestrator'
import { VoyageEmbeddings } from './voyage.embeddings'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeDocument.name, schema: KnowledgeDocumentSchema },
      { name: Chunk.name, schema: ChunkSchema },
    ]),
  ],
  controllers: [KnowledgeController],
  providers: [
    DocumentDbService,
    ChunkDbService,
    // Services depend on the Embeddings abstraction; swap the provider here only.
    { provide: Embeddings, useClass: VoyageEmbeddings },
    KnowledgeService,
    KnowledgeRetrieverService,
    IngestDocumentOrchestrator,
    ListDocumentsOrchestrator,
    RemoveDocumentOrchestrator,
  ],
  exports: [KnowledgeRetrieverService],
})
export class KnowledgeModule {}
