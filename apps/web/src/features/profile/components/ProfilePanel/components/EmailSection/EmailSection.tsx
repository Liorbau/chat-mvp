import {
  SECTION_HEADING_STYLE,
  SECTION_STYLE,
} from '@/features/profile/components/ProfilePanel/ProfilePanel.styles'
import { useEmailChangeContext } from './EmailSection.context'
import { CurrentEmail } from './components/CurrentEmail/CurrentEmail'
import { EmailChangeForm } from './components/EmailChangeForm/EmailChangeForm'
import { ConfirmationNotice } from './components/ConfirmationNotice/ConfirmationNotice'
import { PreviousEmails } from './components/PreviousEmails/PreviousEmails'

export function EmailSection() {
  const { sentTo, hasPreviousEmails } = useEmailChangeContext()

  return (
    <section className={SECTION_STYLE}>
      <h2 className={SECTION_HEADING_STYLE}>Email</h2>
      <CurrentEmail />
      <EmailChangeForm />
      {sentTo != null && <ConfirmationNotice />}
      {hasPreviousEmails && <PreviousEmails />}
    </section>
  )
}
