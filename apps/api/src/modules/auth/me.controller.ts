import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import type { AvatarResponse, User } from '@chat/contract'
import { memoryStorage } from 'multer'
import { CurrentUser } from '../../common/decorators/current.user.decorator'
import { AvatarFilePipe } from '../users/pipes/avatar.file.pipe'
import type { AvatarUpload } from '../users/lib/avatar.types'
import { UploadAvatarOrchestrator } from '../users/orchestrators/upload-avatar.orchestrator'
import { RemoveAvatarOrchestrator } from '../users/orchestrators/remove-avatar.orchestrator'
import { UpdateProfileOrchestrator } from '../users/orchestrators/update-profile.orchestrator'
import { UpdateProfileDto } from '../users/dto/update.profile.dto'
import { JwtAuthGuard } from './jwt.auth.guard'

@Controller()
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private readonly updateProfileOrchestrator: UpdateProfileOrchestrator,
    private readonly uploadAvatarOrchestrator: UploadAvatarOrchestrator,
    private readonly removeAvatarOrchestrator: RemoveAvatarOrchestrator,
  ) {}

  @Get('me')
  me(@CurrentUser() user: User): User {
    return user
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto): Promise<User> {
    return this.updateProfileOrchestrator.execute(user.id, dto)
  }

  @Post('me/avatar')
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile(AvatarFilePipe) upload: AvatarUpload,
  ): Promise<AvatarResponse> {
    return this.uploadAvatarOrchestrator.execute(user.id, upload)
  }

  @Delete('me/avatar')
  async removeAvatar(@CurrentUser() user: User): Promise<AvatarResponse> {
    return this.removeAvatarOrchestrator.execute(user.id)
  }
}
