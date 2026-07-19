import { AvatarSectionContainer } from '@/features/profile/components/ProfilePanel/components/AvatarSection/AvatarSectionContainer'
import { CARD_STYLE, SCREEN_STYLE, SUBTITLE_STYLE, TITLE_STYLE } from './ProfilePanel.constants'
import { useProfileContext } from './ProfilePanel.context'
import { EmailForm } from './EmailForm'
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
        <EmailForm />
      </section>
    </main>
  )
}
