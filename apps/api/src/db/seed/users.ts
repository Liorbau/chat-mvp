import bcrypt from 'bcrypt'
import type { StoredUser } from '../../modules/users/lib/user.mapper'
import { SEED_PASSWORD, SEED_USER_IDS } from './ids'

export function buildSeedUsers(bcryptRounds: number): StoredUser[] {
  const seedPasswordHash = bcrypt.hashSync(SEED_PASSWORD, bcryptRounds)
  const seeds = [
    { id: SEED_USER_IDS.alex, firstName: 'Alex', lastName: 'Rivera', email: 'alex@example.com' },
    { id: SEED_USER_IDS.sam, firstName: 'Sam', lastName: 'Chen', email: 'sam@example.com' },
    { id: SEED_USER_IDS.dana, firstName: 'Dana', lastName: 'Park', email: 'dana@example.com' },
    { id: SEED_USER_IDS.maya, firstName: 'Maya', lastName: 'Singh', email: 'maya@example.com' },
  ]
  return seeds.map((seed) => ({
    ...seed,
    name: `${seed.firstName} ${seed.lastName}`,
    passwordHash: seedPasswordHash,
    avatar: null,
    previousEmails: [],
    tokenVersion: 0,
    subscription: { planKey: 'free', status: 'none' },
  }))
}
