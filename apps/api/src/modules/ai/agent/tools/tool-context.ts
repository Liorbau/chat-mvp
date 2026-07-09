import type { RunnableConfig } from '@langchain/core/runnables'

export const REQUESTER_ID_KEY = 'requesterId'

// The authenticated user id is injected into the run config by the server, never
// supplied by the model. Every tool derives its scope from here.
export function requesterIdFromConfig(config: RunnableConfig): string {
  const requesterId: unknown = config.configurable?.[REQUESTER_ID_KEY]
  if (typeof requesterId !== 'string' || requesterId.length === 0) {
    throw new Error('Tool run config is missing an authenticated requesterId')
  }
  return requesterId
}
