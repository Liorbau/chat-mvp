import type { PlanKey } from '@chat/contract'

export const UPGRADE_TARGET_PLAN: PlanKey = 'pro'

export const PLAN_SECTION_HEADING = 'Plan'

export const CURRENT_PLAN_PREFIX = 'Current plan:'

export const UPGRADE_SUCCESS_MESSAGE = "You're on Pro now. Thanks for upgrading!"

export const UPGRADE_PROCESSING_MESSAGE =
  'Payment received — your Pro upgrade is processing. This can take a few moments.'

export const UPGRADE_TIMEOUT_MESSAGE =
  'Your payment may still be confirming. Refresh this page in a moment — if Pro does not appear, contact support.'

export const UPGRADE_CANCELLED_MESSAGE = 'Upgrade cancelled. No changes were made.'

export const UPGRADE_REDIRECTING_LABEL = 'Redirecting…'

export const POLL_ATTEMPTS = 8

export const POLL_DELAY_MS = 1500
