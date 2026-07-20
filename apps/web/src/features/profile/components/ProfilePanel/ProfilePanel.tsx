import { AvatarSectionContainer } from '@/features/profile/components/ProfilePanel/components/AvatarSection/AvatarSectionContainer'
import { EmailSectionContainer } from '@/features/profile/components/ProfilePanel/components/EmailSection/EmailSectionContainer'
import { CARD_STYLE, SCREEN_STYLE, SUBTITLE_STYLE, TITLE_STYLE } from './ProfilePanel.styles'
import { useProfileContext } from './ProfilePanel.context'
import { NameForm } from './NameForm'

export function ProfilePanel() {
  const { userName } = useProfileContext()

  return (
    <main className={SCREEN_STYLE}>
      <section className={CARD_STYLE}>
        <h1 className={TITLE_STYLE}>Profile</h1>
        <p className={SUBTITLE_STYLE}>Signed in as {userName}.</p>
        <AvatarSectionContainer />
        <NameForm />
        <EmailSectionContainer />
      </section>
    </main>
  )
}
