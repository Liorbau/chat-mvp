export function buildConfirmUrl(webAppUrl: string, token: string): string {
  const url = new URL(webAppUrl)
  url.searchParams.set('emailChangeToken', token)
  return url.toString()
}

export function buildEmailChangeMessage(confirmUrl: string): { subject: string; text: string } {
  return {
    subject: 'Confirm your new email address',
    text: `Confirm your email change by opening this link:\n\n${confirmUrl}\n\nIf you didn't request this, you can ignore this email.`,
  }
}
