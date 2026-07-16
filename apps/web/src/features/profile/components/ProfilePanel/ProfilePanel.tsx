import { CARD_STYLE, SCREEN_STYLE, SUBTITLE_STYLE, TITLE_STYLE } from './ProfilePanel.constants'
import type { ProfilePanelProps } from './ProfilePanel.types'
import { EmailForm } from './EmailForm'
import { NameForm } from './NameForm'

// Presentational: renders the card and the two forms from props only.
export function ProfilePanel({ userName, name, email }: ProfilePanelProps) {
  return (
    <main className={SCREEN_STYLE}>
      <section className={CARD_STYLE}>
        <h1 className={TITLE_STYLE}>Profile</h1>
        <p className={SUBTITLE_STYLE}>Signed in as {userName}.</p>
        <NameForm {...name} />
        <EmailForm {...email} />
      </section>
    </main>
  )
}
