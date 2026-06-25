import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { MongooseModule } from '@nestjs/mongoose'
import { AllExceptionsFilter } from './common/filters/all.exceptions.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { validateEnv } from './config/env.validation'
import { AiModule } from './modules/ai/ai.module'
import { AuthModule } from './modules/auth/auth.module'
import { ConversationsModule } from './modules/conversations/conversations.module'
import { MessagesModule } from './modules/messages/messages.module'
import { UsersModule } from './modules/users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      ignoreEnvFile: process.env.VITEST !== undefined,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): { uri: string } => ({
        uri: configService.getOrThrow<string>('MONGO_URI'),
      }),
    }),
    UsersModule,
    AuthModule,
    ConversationsModule,
    MessagesModule,
    AiModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
