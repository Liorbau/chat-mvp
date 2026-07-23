import type { Subscription } from './subscription'

export type User = {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  avatarUrl: string | null
  previousEmails: string[]
  subscription: Subscription
}

export type UpdateProfileRequest = {
  firstName?: string
  lastName?: string
}
