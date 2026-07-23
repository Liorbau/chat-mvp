import { AvatarSectionContainer } from '@/features/profile/components/ProfilePanel/components/AvatarSection/AvatarSectionContainer'
import { EmailSectionContainer } from '@/features/profile/components/ProfilePanel/components/EmailSection/EmailSectionContainer'
import { NameSectionContainer } from '@/features/profile/components/ProfilePanel/components/NameSection/NameSectionContainer'
import { PlanSectionContainer } from '@/features/profile/components/ProfilePanel/components/PlanSection/PlanSectionContainer'
import { CARD_STYLE, SCREEN_STYLE, SUBTITLE_STYLE, TITLE_STYLE } from './ProfilePanel.styles'
import { useProfileContext } from './ProfilePanel.context'

export function ProfilePanel() {
  const { userName } = useProfileContext()

  return (
    <main className={SCREEN_STYLE}>
      <section className={CARD_STYLE}>
        <h1 className={TITLE_STYLE}>Profile</h1>
        <p className={SUBTITLE_STYLE}>Signed in as {userName}.</p>
        <AvatarSectionContainer />
        <NameSectionContainer />
        <EmailSectionContainer />
        <PlanSectionContainer />
      </section>
    </main>
  )
}
