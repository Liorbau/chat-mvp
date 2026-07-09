import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthModule } from '../auth/auth.module'
import { ConversationsModule } from '../conversations/conversations.module'
import { KnowledgeModule } from '../knowledge/knowledge.module'
import { MessagesModule } from '../messages/messages.module'
import { UsersModule } from '../users/users.module'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'
import { ConversationMemoryService } from './conversation.memory.service'
import { LLM_PROVIDER, type LlmProvider } from './llm.provider'
import { AnthropicProvider } from './providers/anthropic.provider'
import { OpenAiProvider } from './providers/openai.provider'
import { AiToolsService } from './tools/ai.tools.service'
import { GetMyNameTool } from './tools/get.my.name.tool'
import { SummarizeRecentMessagesTool } from './tools/summarize.recent.messages.tool'
import { TutorService } from './tutor.service'

@Module({
  imports: [AuthModule, ConversationsModule, MessagesModule, UsersModule, KnowledgeModule],
  controllers: [AiController],
  providers: [
    AiService,
    TutorService,
    ConversationMemoryService,
    AiToolsService,
    SummarizeRecentMessagesTool,
    GetMyNameTool,
    {
      // Build only the selected provider; the unused one is never instantiated.
      provide: LLM_PROVIDER,
      useFactory: (configService: ConfigService): LlmProvider =>
        configService.get<string>('LLM_PROVIDER') === 'anthropic'
          ? new AnthropicProvider(configService)
          : new OpenAiProvider(configService),
      inject: [ConfigService],
    },
  ],
  exports: [ConversationMemoryService, LLM_PROVIDER],
})
export class AiModule {}
