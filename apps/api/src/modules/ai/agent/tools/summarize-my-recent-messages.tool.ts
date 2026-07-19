import { tool } from '@langchain/core/tools'
import type { SummarizeService } from './summarize.service'
import { InputSchema } from './summarize.shared'
import { requesterIdFromConfig } from './tool-context'

export function buildSummarizeTool(summarize: SummarizeService) {
  return tool((input, config) => summarize.summarize(input, requesterIdFromConfig(config)), {
    name: 'summarize_my_recent_messages',
    description:
      "Summarize the user's recent conversations with other people, returning one short summary per conversation.",
    schema: InputSchema,
  })
}
