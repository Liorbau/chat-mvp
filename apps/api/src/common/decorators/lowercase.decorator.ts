import { Transform } from 'class-transformer'

export function Lowercase(): PropertyDecorator {
  return Transform(({ value }) => {
    return typeof value === 'string' ? value.toLowerCase() : value
  })
}
