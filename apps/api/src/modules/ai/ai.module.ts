import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AuthModule } from '../auth/auth.module'
import { ConversationsModule } from '../conversations/conversations.module'
import { MessagesModule } from '../messages/messages.module'
import { UsersModule } from '../users/users.module'
import { AiController } from './ai.controller'
import { AiService } from './ai.service'
import { ConversationMemoryService } from './conversation.memory.service'
import { LlmProvider } from './llm.provider'
import { AnthropicProvider } from './providers/anthropic.provider'
import { OpenAiProvider } from './providers/openai.provider'
import { AiToolsService } from './tools/ai.tools.service'
import { GetMyNameTool } from './tools/get.my.name.tool'
import { SummarizeRecentMessagesTool } from './tools/summarize.recent.messages.tool'

@Module({
  imports: [AuthModule, ConversationsModule, MessagesModule, UsersModule],
  controllers: [AiController],
  providers: [
    AiService,
    ConversationMemoryService,
    AiToolsService,
    SummarizeRecentMessagesTool,
    GetMyNameTool,
    OpenAiProvider,
    AnthropicProvider,
    {
      provide: LlmProvider,
      useFactory: (
        configService: ConfigService,
        openAi: OpenAiProvider,
        anthropic: AnthropicProvider,
      ): LlmProvider =>
        configService.get<string>('LLM_PROVIDER') === 'anthropic' ? anthropic : openAi,
      inject: [ConfigService, OpenAiProvider, AnthropicProvider],
    },
  ],
  exports: [ConversationMemoryService, LlmProvider],
})
export class AiModule {}
