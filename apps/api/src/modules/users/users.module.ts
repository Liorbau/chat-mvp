import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { StorageModule } from '../storage/storage.module'
import { ListUsersOrchestrator } from './orchestrators/list-users.orchestrator'
import { RemoveAvatarOrchestrator } from './orchestrators/remove-avatar.orchestrator'
import { UpdateProfileOrchestrator } from './orchestrators/update-profile.orchestrator'
import { UploadAvatarOrchestrator } from './orchestrators/upload-avatar.orchestrator'
import { User, UserSchema } from './user.schema'
import { PasswordHasher } from './password-hasher.service'
import { UsersController } from './users.controller'
import { UsersDbService } from './users.dbService'
import { UsersService } from './users.service'

@Module({
  imports: [
    PassportModule,
    StorageModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersDbService,
    PasswordHasher,
    ListUsersOrchestrator,
    UpdateProfileOrchestrator,
    UploadAvatarOrchestrator,
    RemoveAvatarOrchestrator,
  ],
  exports: [
    UsersService,
    PasswordHasher,
    UpdateProfileOrchestrator,
    UploadAvatarOrchestrator,
    RemoveAvatarOrchestrator,
  ],
})
export class UsersModule {}
