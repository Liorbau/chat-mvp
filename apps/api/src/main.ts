import type { NestExpressApplication } from '@nestjs/platform-express'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { resetStore } from './db/store'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)

  // Seed the in-memory stores before the app starts accepting traffic.
  resetStore(configService.getOrThrow<number>('BCRYPT_ROUNDS'))

  app.enableCors({
    origin: configService.getOrThrow<string>('CORS_ORIGIN'),
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  const port = configService.getOrThrow<number>('PORT')
  await app.listen(port)
  console.log(`API listening on http://localhost:${port}`)
}

void bootstrap()
