import type { LlmToolDef, LlmToolResult, LlmToolUse } from '../llm.provider'

export abstract class AiTool {
  abstract readonly definition: LlmToolDef
  abstract execute(toolUse: LlmToolUse, requesterId: string): Promise<LlmToolResult>
}
