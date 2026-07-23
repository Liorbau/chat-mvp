import type { NestExpressApplication } from '@nestjs/platform-express'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { JSON_BODY_LIMIT } from './config/http.constants'

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true })
  app.useBodyParser('json', { limit: JSON_BODY_LIMIT })
  const configService = app.get(ConfigService)

  app.enableCors({
    origin: configService.getOrThrow<string>('CORS_ORIGIN'),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  const port = configService.getOrThrow<number>('PORT')
  await app.listen(port)
  logger.log(`API listening on http://localhost:${port}`)
}

void bootstrap()
