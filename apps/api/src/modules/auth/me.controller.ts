import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { User } from '@chat/contract'
import { memoryStorage } from 'multer'
import { CurrentUser } from '../../common/decorators/current.user.decorator'
import { AvatarFilePipe } from '../users/avatar.file.pipe'
import type { AvatarUpload } from '../users/avatar.types'
import { UploadAvatarOrchestrator } from '../users/upload-avatar.orchestrator'
import { RemoveAvatarOrchestrator } from '../users/remove-avatar.orchestrator'
import { UpdateProfileDto } from '../users/dto/update.profile.dto'
import { UsersService } from '../users/users.service'
import { AVATAR_MAX_BYTES } from '../storage/storage.constants'
import { JwtAuthGuard } from './jwt.auth.guard'

@Controller()
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private readonly usersService: UsersService,
    private readonly uploadAvatarOrchestrator: UploadAvatarOrchestrator,
    private readonly removeAvatarOrchestrator: RemoveAvatarOrchestrator,
  ) {}

  @Get('me')
  me(@CurrentUser() user: User): User {
    return user
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto): Promise<User> {
    return this.usersService.updateProfile(user.id, dto)
  }

  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: AVATAR_MAX_BYTES } }),
  )
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile(AvatarFilePipe) upload: AvatarUpload,
  ): Promise<User> {
    return this.uploadAvatarOrchestrator.execute(user.id, upload)
  }

  @Delete('me/avatar')
  async removeAvatar(@CurrentUser() user: User): Promise<User> {
    return this.removeAvatarOrchestrator.execute(user.id)
  }
}
