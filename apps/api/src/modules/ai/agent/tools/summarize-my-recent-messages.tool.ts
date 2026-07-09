import { tool } from '@langchain/core/tools'
import type { SummarizeRecentMessagesTool } from '../../tools/summarize.recent.messages.tool'
import { InputSchema } from '../../tools/summarize.shared'
import { requesterIdFromConfig } from './tool-context'

export function buildSummarizeTool(summarize: SummarizeRecentMessagesTool) {
  return tool((input, config) => summarize.summarize(input, requesterIdFromConfig(config)), {
    name: 'summarize_my_recent_messages',
    description:
      "Summarize the user's recent conversations with other people, returning one short summary per conversation.",
    schema: InputSchema,
  })
}
