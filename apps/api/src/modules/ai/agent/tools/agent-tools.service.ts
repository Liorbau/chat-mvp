import type { StructuredToolInterface } from '@langchain/core/tools'
import { Injectable } from '@nestjs/common'
import { KnowledgeRetrieverService } from '../../../knowledge/knowledge.retriever.service'
import { UsersService } from '../../../users/users.service'
import { SummarizeService } from './summarize.service'
import { buildGetMyNameTool } from './get-my-name.tool'
import { buildRetrieveTool, RETRIEVE_TOOL_NAME } from './retrieve-knowledge.tool'
import { buildSummarizeTool } from './summarize-my-recent-messages.tool'

@Injectable()
export class AgentToolsService {
  private readonly tools: StructuredToolInterface[]

  constructor(
    retriever: KnowledgeRetrieverService,
    usersService: UsersService,
    summarize: SummarizeService,
  ) {
    this.tools = [
      buildRetrieveTool(retriever),
      buildGetMyNameTool(usersService),
      buildSummarizeTool(summarize),
    ]
  }

  all(): StructuredToolInterface[] {
    return this.tools
  }

  get(name: string): StructuredToolInterface | undefined {
    return this.tools.find((tool) => tool.name === name)
  }

  isRetrieval(name: string): boolean {
    return name === RETRIEVE_TOOL_NAME
  }
}
