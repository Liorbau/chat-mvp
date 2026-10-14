import { SOURCE_SNIPPET_MAX } from './MessageSources.constants'

export function sourceSnippet(text: string): string {
  return text.length > SOURCE_SNIPPET_MAX ? `${text.slice(0, SOURCE_SNIPPET_MAX)}…` : text
}
