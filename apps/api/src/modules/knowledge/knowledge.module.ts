import { Embeddings } from '@langchain/core/embeddings'
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { Chunk, ChunkSchema } from './chunk.schema'
import { KnowledgeDocument, KnowledgeDocumentSchema } from './document.schema'
import { KnowledgeController } from './knowledge.controller'
import { KnowledgeDbService } from './knowledge.dbService'
import { KnowledgeRetrieverService } from './knowledge.retriever.service'
import { KnowledgeService } from './knowledge.service'
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
    KnowledgeDbService,
    // Services depend on the Embeddings abstraction; swap the provider here only.
    { provide: Embeddings, useClass: VoyageEmbeddings },
    KnowledgeService,
    KnowledgeRetrieverService,
  ],
  exports: [KnowledgeRetrieverService],
})
export class KnowledgeModule {}
