import { Transform } from 'class-transformer'

export function Trim(): PropertyDecorator {
  return Transform(({ value }) => {
    return typeof value === 'string' ? value.trim() : value
  })
}

export function TrimEach(): PropertyDecorator {
  return Transform(({ value }) => {
    if (!Array.isArray(value)) {
      return value
    }

    return value.map((item) => {
      return typeof item === 'string' ? item.trim() : item
    })
  })
}
