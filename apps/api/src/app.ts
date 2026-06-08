import cors from 'cors'
import express from 'express'
import { env } from './config/env'
import './db/store'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'
import { requestLogger } from './middleware/requestLogger'
import { authRouter } from './modules/auth/auth.router'
import { conversationsRouter } from './modules/conversations/conversations.router'
import { messagesRouter } from './modules/messages/messages.router'

export function createApp() {
  const app = express()

  app.use(express.json({ limit: '100kb' }))
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  app.use(requestLogger)

  app.use('/auth', authRouter)
  app.use('/conversations', conversationsRouter)
  app.use('/conversations/:id/messages', messagesRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}
