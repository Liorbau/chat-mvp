import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { ConversationsModule } from '../conversations/conversations.module'
import { KnowledgeModule } from '../knowledge/knowledge.module'
import { MessagesModule } from '../messages/messages.module'
import { UsersModule } from '../users/users.module'
import { AgentService } from './agent/agent.service'
import { checkpointerProvider } from './agent/checkpointer.provider'
import { AgentToolsService } from './agent/tools/agent-tools.service'
import { AiController } from './ai.controller'
import { ConversationMemoryService } from './conversation.memory.service'
import { StreamAgentReplyOrchestrator } from './stream-agent-reply.orchestrator'
import { SummarizeRecentMessagesTool } from './tools/summarize.recent.messages.tool'

@Module({
  imports: [AuthModule, ConversationsModule, MessagesModule, UsersModule, KnowledgeModule],
  controllers: [AiController],
  providers: [
    AgentService,
    AgentToolsService,
    checkpointerProvider,
    ConversationMemoryService,
    StreamAgentReplyOrchestrator,
    SummarizeRecentMessagesTool,
  ],
  exports: [ConversationMemoryService],
})
export class AiModule {}
