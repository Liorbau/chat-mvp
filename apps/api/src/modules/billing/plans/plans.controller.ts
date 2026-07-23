import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common'
import type { ListPlansResponse, PaymentSessionResponse, User } from '@chat/contract'
import { CurrentUser } from '../../../common/decorators/current.user.decorator'
import { JwtAuthGuard } from '../../auth/jwt/jwt.auth.guard'
import { CreatePaymentSessionOrchestrator } from '../orchestrators/create-payment-session.orchestrator'
import { ListPlansOrchestrator } from '../orchestrators/list-plans.orchestrator'
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto'

@Controller('users/plans')
@UseGuards(JwtAuthGuard)
export class PlansController {
  constructor(
    private readonly listPlansOrchestrator: ListPlansOrchestrator,
    private readonly createPaymentSessionOrchestrator: CreatePaymentSessionOrchestrator,
  ) {}

  @Get()
  async list(): Promise<ListPlansResponse> {
    return this.listPlansOrchestrator.execute()
  }

  @Post('payment-session')
  @HttpCode(200)
  async createPaymentSession(
    @CurrentUser() user: User,
    @Body() dto: CreatePaymentSessionDto,
  ): Promise<PaymentSessionResponse> {
    return this.createPaymentSessionOrchestrator.execute(user.id, dto)
  }
}
