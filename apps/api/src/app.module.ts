import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { MongooseModule } from '@nestjs/mongoose'
import { AllExceptionsFilter } from './common/filters/all.exceptions.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import {
  configModuleOptions,
  globalValidationPipe,
  mongooseAsyncOptions,
} from './config/module-options'
import { AiModule } from './modules/ai/ai.module'
import { AuthModule } from './modules/auth/auth.module'
import { BillingModule } from './modules/billing/billing.module'
import { ConversationsModule } from './modules/conversations/conversations.module'
import { KnowledgeModule } from './modules/knowledge/knowledge.module'
import { MessagesModule } from './modules/messages/messages.module'
import { UsersModule } from './modules/users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    MongooseModule.forRootAsync(mongooseAsyncOptions),
    UsersModule,
    AuthModule,
    BillingModule,
    ConversationsModule,
    MessagesModule,
    KnowledgeModule,
    AiModule,
  ],
  providers: [
    { provide: APP_PIPE, useValue: globalValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
