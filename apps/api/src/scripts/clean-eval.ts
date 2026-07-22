import { getConnectionToken } from '@nestjs/mongoose'
import { NestFactory } from '@nestjs/core'
import type { Connection } from 'mongoose'
import { AppModule } from '../app.module'

// Eval runs sign up throwaway users as `eval_<pid>_<ts>@example.com`; this script
// removes those users and everything they own. Dry run by default; pass --delete
// to actually remove. Runs against whatever MONGO_URI the app is configured with.
const EVAL_EMAIL = /^eval_.*@example\.com$/

async function cleanEval(): Promise<void> {
  const shouldDelete = process.argv.includes('--delete')
  const app = await NestFactory.createApplicationContext(AppModule)
  try {
    const connection = app.get<Connection>(getConnectionToken())
    const db = connection.db
    if (!db) {
      throw new Error('No database connection')
    }

    const evalUsers = await db
      .collection<{ _id: string; email: string }>('users')
      .find({ email: EVAL_EMAIL })
      .project<{ _id: string; email: string }>({ _id: 1, email: 1 })
      .toArray()
    const evalIds = evalUsers.map((user) => user._id)

    const conversations = await db
      .collection<{ _id: string }>('conversations')
      .find({ participantIds: { $in: evalIds } })
      .project<{ _id: string }>({ _id: 1 })
      .toArray()
    const conversationIds = conversations.map((conversation) => conversation._id)

    const messageFilter = {
      $or: [{ conversationId: { $in: conversationIds } }, { senderId: { $in: evalIds } }],
    }

    console.log('Eval cleanup targets:')
    console.log({
      users: evalIds.length,
      conversations: conversationIds.length,
      messages: await db.collection('messages').countDocuments(messageFilter),
      kb_documents: await db
        .collection('kb_documents')
        .countDocuments({ userId: { $in: evalIds } }),
      kb_chunks: await db.collection('kb_chunks').countDocuments({ userId: { $in: evalIds } }),
    })
    console.log(
      'Sample emails:',
      evalUsers.slice(0, 10).map((user) => user.email),
    )

    if (!shouldDelete) {
      console.log('\nDry run — re-run with --delete to remove these.')
      return
    }
    if (evalIds.length === 0) {
      console.log('\nNothing to delete.')
      return
    }

    await db.collection('kb_chunks').deleteMany({ userId: { $in: evalIds } })
    await db.collection('kb_documents').deleteMany({ userId: { $in: evalIds } })
    await db.collection('messages').deleteMany(messageFilter)
    await db
      .collection<{ _id: string }>('conversations')
      .deleteMany({ _id: { $in: conversationIds } })
    await db.collection<{ _id: string }>('users').deleteMany({ _id: { $in: evalIds } })
    console.log('\nDeleted eval users and their data.')
  } finally {
    await app.close()
  }
}

void cleanEval()
