import { applyDecorators } from '@nestjs/common'
import { IsOptional, IsString, Matches, MinLength, ValidateIf } from 'class-validator'

const HTTP_URL_PATTERN = /^https?:\/\//

export function RequiredString(minLength = 1): PropertyDecorator {
  return applyDecorators(IsString(), MinLength(minLength))
}

export function OptionalString(): PropertyDecorator {
  return applyDecorators(IsOptional(), IsString(), MinLength(1))
}

export function HttpUrl(): PropertyDecorator {
  return applyDecorators(
    IsString(),
    Matches(HTTP_URL_PATTERN, { message: '$property must be an http(s) URL' }),
  )
}

export function RequiredWhen<T extends object>(predicate: (env: T) => boolean): PropertyDecorator {
  return applyDecorators(
    ValidateIf((env: T) => predicate(env)),
    IsString(),
    MinLength(1),
  )
}
