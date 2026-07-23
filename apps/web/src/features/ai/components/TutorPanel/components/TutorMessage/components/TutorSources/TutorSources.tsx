import { SOURCE_SNIPPET_MAX } from '../../../../TutorPanel.constants'
import {
  SOURCE_CARD_STYLE,
  SOURCE_SUMMARY_STYLE,
  SOURCE_TEXT_STYLE,
  SOURCES_LABEL_STYLE,
  SOURCES_STYLE,
} from '../../../../TutorPanel.styles'
import type { TutorSourcesProps } from '../../../../TutorPanel.types'

function snippet(text: string): string {
  return text.length > SOURCE_SNIPPET_MAX ? `${text.slice(0, SOURCE_SNIPPET_MAX)}…` : text
}

export function TutorSources({ citations }: TutorSourcesProps) {
  return (
    <div className={SOURCES_STYLE}>
      <span className={SOURCES_LABEL_STYLE}>Sources</span>
      {citations.map((citation) => (
        <details key={citation.chunkId} className={SOURCE_CARD_STYLE}>
          <summary className={SOURCE_SUMMARY_STYLE}>📄 {citation.documentName}</summary>
          <p className={SOURCE_TEXT_STYLE}>{snippet(citation.text)}</p>
        </details>
      ))}
    </div>
  )
}
