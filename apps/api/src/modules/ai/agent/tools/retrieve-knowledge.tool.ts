import { tool } from '@langchain/core/tools'
import { z } from 'zod'
import type {
  KnowledgeRetrieverService,
  RetrievedChunk,
} from '../../../knowledge/knowledge.retriever.service'
import { requesterIdFromConfig } from './tool-context'

export const RETRIEVE_TOOL_NAME = 'retrieve_knowledge'

const schema = z.object({
  query: z.string().describe('Search query, usually the user question.'),
})

function formatChunks(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "No relevant passages were found in the user's documents."
  }
  return chunks.map((chunk, i) => `[${i + 1}] (${chunk.documentName})\n${chunk.text}`).join('\n\n')
}

// content_and_artifact: the model reads the formatted text; the graph reads the
// structured chunks (artifact) to build citations without re-parsing.
export function buildRetrieveTool(retriever: KnowledgeRetrieverService) {
  return tool(
    async ({ query }, config): Promise<[string, RetrievedChunk[]]> => {
      const chunks = await retriever.retrieve(requesterIdFromConfig(config), query)
      return [formatChunks(chunks), chunks]
    },
    {
      name: RETRIEVE_TOOL_NAME,
      description:
        "Search the user's own uploaded notes and documents for passages relevant to their question. Use this whenever the question is about the content of their uploaded materials.",
      schema,
      responseFormat: 'content_and_artifact',
    },
  )
}
