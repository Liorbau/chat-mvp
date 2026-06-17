import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common'
import type { Request, Response } from 'express'
import type { Observable } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now()
    const http = context.switchToHttp()
    const request = http.getRequest<Request>()
    const response = http.getResponse<Response>()

    // 'finish' fires after the response is fully sent (including after the
    // exception filter), so the logged status is the final one.
    response.on('finish', () => {
      const durationMs = Date.now() - startedAt
      this.logger.log(
        `${request.method} ${request.originalUrl} ${response.statusCode} ${durationMs}ms`,
      )
    })

    return next.handle()
  }
}
