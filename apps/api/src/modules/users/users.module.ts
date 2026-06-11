import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { UsersController } from './users.controller'
import { UsersDbService } from './users.dbService'
import { UsersService } from './users.service'

@Module({
  imports: [PassportModule],
  controllers: [UsersController],
  providers: [UsersService, UsersDbService],
  exports: [UsersService],
})
export class UsersModule {}
