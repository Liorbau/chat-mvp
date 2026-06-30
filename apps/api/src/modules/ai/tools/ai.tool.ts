import type { LlmToolDef, LlmToolResult, LlmToolUse } from '../llm.provider'

export type AiTool = {
  readonly definition: LlmToolDef
  execute(toolUse: LlmToolUse, requesterId: string): Promise<LlmToolResult>
}
