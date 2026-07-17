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
import { AppError } from '../../errors/AppError'
import { AvatarService } from '../users/avatar.service'
import { UpdateProfileDto } from '../users/dto/update.profile.dto'
import { UsersService } from '../users/users.service'
import { AVATAR_MAX_BYTES } from '../storage/storage.constants'
import { JwtAuthGuard } from './jwt.auth.guard'

@Controller()
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private readonly usersService: UsersService,
    private readonly avatarService: AvatarService,
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
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<User> {
    if (file === undefined) {
      throw AppError.badRequest('VALIDATION_ERROR', 'No file uploaded (form field "file").')
    }
    return this.avatarService.uploadAvatar(user.id, {
      buffer: file.buffer,
      mimeType: file.mimetype,
      size: file.size,
    })
  }

  @Delete('me/avatar')
  async removeAvatar(@CurrentUser() user: User): Promise<User> {
    return this.avatarService.removeAvatar(user.id)
  }
}
