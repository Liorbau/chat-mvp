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
import type { AvatarResponse, RequestEmailChangeResponse, User } from '@chat/contract'
import { memoryStorage } from 'multer'
import { CurrentUser } from '../../common/decorators/current.user.decorator'
import { AvatarFilePipe } from '../users/pipes/avatar.file.pipe'
import type { AvatarUpload } from '../users/lib/avatar.types'
import { UploadAvatarOrchestrator } from '../users/orchestrators/upload-avatar.orchestrator'
import { RemoveAvatarOrchestrator } from '../users/orchestrators/remove-avatar.orchestrator'
import { UpdateProfileOrchestrator } from '../users/orchestrators/update-profile.orchestrator'
import { UpdateProfileDto } from '../users/dto/update.profile.dto'
import { RequestEmailChangeOrchestrator } from './orchestrators/request-email-change.orchestrator'
import { RequestEmailChangeDto } from './dto/request-email-change.dto'
import { JwtAuthGuard } from './jwt/jwt.auth.guard'

@Controller()
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private readonly updateProfileOrchestrator: UpdateProfileOrchestrator,
    private readonly uploadAvatarOrchestrator: UploadAvatarOrchestrator,
    private readonly removeAvatarOrchestrator: RemoveAvatarOrchestrator,
    private readonly requestEmailChangeOrchestrator: RequestEmailChangeOrchestrator,
  ) {}

  @Get('me')
  me(@CurrentUser() user: User): User {
    return user
  }

  @Patch('me')
  async updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto): Promise<User> {
    return this.updateProfileOrchestrator.execute(user.id, dto)
  }

  @Post('me/email')
  @HttpCode(200)
  async requestEmailChange(
    @CurrentUser() user: User,
    @Body() dto: RequestEmailChangeDto,
  ): Promise<RequestEmailChangeResponse> {
    return this.requestEmailChangeOrchestrator.execute(user, dto)
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
