import { MongoDBSaver, type MongoDBSaverParams } from '@langchain/langgraph-checkpoint-mongodb'
import type { Provider } from '@nestjs/common'
import { getConnectionToken } from '@nestjs/mongoose'
import type { Connection } from 'mongoose'

export const AGENT_CHECKPOINTER = Symbol('AGENT_CHECKPOINTER')

// The saver's mongodb (6) differs from mongoose's (7); the client is runtime-
// compatible, so we bridge the type — same pattern the vector store already uses
// for this skew (knowledge.retriever.service).
type SaverClient = MongoDBSaverParams['client']

export const checkpointerProvider: Provider = {
  provide: AGENT_CHECKPOINTER,
  useFactory: async (connection: Connection): Promise<MongoDBSaver> => {
    const saver = new MongoDBSaver({
      client: connection.getClient() as unknown as SaverClient,
      dbName: connection.name,
    })
    await saver.setup()
    return saver
  },
  inject: [getConnectionToken()],
}
