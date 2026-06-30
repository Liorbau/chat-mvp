import { Injectable } from '@nestjs/common'
import { UsersService } from '../../users/users.service'
import type { LlmToolDef, LlmToolResult, LlmToolUse } from '../llm.provider'
import type { AiTool } from './ai.tool'

@Injectable()
export class GetMyNameTool implements AiTool {
  readonly definition: LlmToolDef = {
    name: 'get_my_name',
    description: 'Get the display name of the current user (the person you are talking to).',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  }

  constructor(private readonly usersService: UsersService) {}

  // Scoped to the JWT requesterId; returns only the name, never id/email/hash.
  async execute(toolUse: LlmToolUse, requesterId: string): Promise<LlmToolResult> {
    const user = await this.usersService.findById(requesterId)
    if (user === undefined) {
      return { id: toolUse.id, content: 'Your account could not be found.', isError: true }
    }
    return { id: toolUse.id, content: JSON.stringify({ name: user.name }) }
  }
}
