import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { PaymentSessionResponse } from '@chat/contract'
import { AppError } from '../../../errors/AppError'
import { UsersService } from '../../users/users.service'
import { PAYMENT_PROVIDER, type PaymentProvider } from '../payment/payment.provider'
import { buildCheckoutReturnUrls } from '../lib/checkout-urls'
import type { CreatePaymentSessionDto } from '../plans/dto/create-payment-session.dto'
import { PlansService } from '../plans/plans.service'

@Injectable()
export class CreatePaymentSessionOrchestrator {
  constructor(
    private readonly plansService: PlansService,
    private readonly usersService: UsersService,
    @Inject(PAYMENT_PROVIDER) private readonly payment: PaymentProvider,
    private readonly configService: ConfigService,
  ) {}

  async execute(userId: string, dto: CreatePaymentSessionDto): Promise<PaymentSessionResponse> {
    const user = await this.usersService.findById(userId)
    if (!user) {
      throw AppError.notFound('User not found')
    }
    if (user.subscription.planKey === dto.planKey && user.subscription.status === 'active') {
      throw AppError.conflict(
        'SUBSCRIPTION_ALREADY_ACTIVE',
        `You already have an active '${dto.planKey}' subscription.`,
      )
    }
    const plan = await this.plansService.getPurchasablePlan(dto.planKey)
    const { completeUrl, cancelUrl } = buildCheckoutReturnUrls(
      this.configService.getOrThrow<string>('WEB_APP_URL'),
    )
    const { redirectUrl } = await this.payment.createCheckout({
      userId,
      planKey: plan.key,
      amount: plan.priceAmount,
      currency: plan.currency,
      completeUrl,
      cancelUrl,
    })
    return { redirectUrl }
  }
}
