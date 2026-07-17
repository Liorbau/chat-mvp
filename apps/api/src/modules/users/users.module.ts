import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { StorageModule } from '../storage/storage.module'
import { AvatarService } from './avatar.service'
import { User, UserSchema } from './user.schema'
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
  providers: [UsersService, UsersDbService, AvatarService],
  exports: [UsersService, AvatarService],
})
export class UsersModule {}
