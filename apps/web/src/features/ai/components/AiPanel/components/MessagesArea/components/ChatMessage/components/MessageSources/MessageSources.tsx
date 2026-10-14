import { SOURCES_LABEL } from './MessageSources.constants'
import {
  SOURCE_CARD_STYLE,
  SOURCE_SUMMARY_STYLE,
  SOURCE_TEXT_STYLE,
  SOURCES_LABEL_STYLE,
  SOURCES_STYLE,
} from './MessageSources.styles'
import type { MessageSourcesProps } from './MessageSources.types'
import { sourceSnippet } from './MessageSources.utils'

export function MessageSources({ citations }: MessageSourcesProps) {
  return citations && citations.length > 0 ? (
    <div className={SOURCES_STYLE}>
      <span className={SOURCES_LABEL_STYLE}>{SOURCES_LABEL}</span>
      {citations.map((citation) => (
        <details key={citation.chunkId} className={SOURCE_CARD_STYLE}>
          <summary className={SOURCE_SUMMARY_STYLE}>📄 {citation.documentName}</summary>
          <p className={SOURCE_TEXT_STYLE}>{sourceSnippet(citation.text)}</p>
        </details>
      ))}
    </div>
  ) : null
}
