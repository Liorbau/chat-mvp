import { Module, ValidationPipe } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { validateEnv } from './config/env.validation'
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
    UsersModule,
    AuthModule,
    ConversationsModule,
    MessagesModule,
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
