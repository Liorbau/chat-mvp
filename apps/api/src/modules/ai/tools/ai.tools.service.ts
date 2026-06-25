import { Injectable } from '@nestjs/common'
import type { LlmToolDef, LlmToolResult, LlmToolUse } from '../llm.provider'
import type { AiTool } from './ai.tool'
import { GetMyNameTool } from './get.my.name.tool'
import { SummarizeRecentMessagesTool } from './summarize.recent.messages.tool'

@Injectable()
export class AiToolsService {
  private readonly tools: Map<string, AiTool>

  constructor(summarizeRecentMessages: SummarizeRecentMessagesTool, getMyName: GetMyNameTool) {
    const tools: AiTool[] = [summarizeRecentMessages, getMyName]
    this.tools = new Map(tools.map((tool) => [tool.definition.name, tool]))
  }

  definitions(): LlmToolDef[] {
    return [...this.tools.values()].map((tool) => tool.definition)
  }

  execute(toolUse: LlmToolUse, requesterId: string): Promise<LlmToolResult> {
    if (toolUse.parseError !== undefined) {
      return Promise.resolve({
        id: toolUse.id,
        content: `Could not parse tool arguments: ${toolUse.parseError}`,
        isError: true,
      })
    }

    const tool = this.tools.get(toolUse.name)
    if (tool === undefined) {
      return Promise.resolve({
        id: toolUse.id,
        content: `Unknown tool: ${toolUse.name}`,
        isError: true,
      })
    }
    return tool.execute(toolUse, requesterId)
  }
}
