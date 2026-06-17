import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      JWT_SECRET: 'test-secret-at-least-32-characters-long',
      BCRYPT_ROUNDS: '4', // For fast testing (less secure than production)
    },
  },
})
