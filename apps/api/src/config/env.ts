function readNumber(rawValue: string | undefined, fallback: number): number {
  if (rawValue === undefined) {
    return fallback
  }

  const parsed = Number(rawValue)
  if (Number.isNaN(parsed)) {
    return fallback
  }

  return parsed
}

export const env = {
  PORT: readNumber(process.env.PORT, 4000),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
} as const
