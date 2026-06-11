import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import type { User } from '@chat/contract'
import type { StoredUser } from '../../db/users.store'
import { getAllUsers, getUser, getUserByEmail, setUser } from '../../db/users.store'

export type StoredUserDraft = Omit<StoredUser, 'id'>

export function toPublicUser(user: StoredUser): User {
  return { id: user.id, name: user.name, email: user.email }
}

@Injectable()
export class UsersDbService {
  list(): User[] {
    return getAllUsers().map(toPublicUser)
  }

  findById(userId: string): User | undefined {
    const user = getUser(userId)
    return user === undefined ? undefined : toPublicUser(user)
  }

  findByEmail(email: string): StoredUser | undefined {
    return getUserByEmail(email)
  }

  create(draft: StoredUserDraft): StoredUser {
    const user: StoredUser = { id: randomUUID(), ...draft }
    setUser(user)
    return user
  }
}
