import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    fileParallelism: false,
    maxWorkers: 1,
    env: {
      JWT_SECRET: 'test-secret-at-least-32-characters-long',
      BCRYPT_ROUNDS: '4', // For fast testing (less secure than production)
      MONGO_URI: 'mongodb://localhost:27017/chat-test?replicaSet=rs0',
      // Dummy keys so env validation passes at boot; no test calls a live API.
      LLM_PROVIDER: 'openai',
      OPENAI_API_KEY: 'sk-test-key',
      ANTHROPIC_API_KEY: 'sk-ant-test-key',
    },
  },
})
