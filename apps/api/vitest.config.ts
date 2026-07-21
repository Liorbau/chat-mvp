import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    fileParallelism: false,
    maxWorkers: 1,
    env: {
      JWT_SECRET: 'test-secret-at-least-32-characters-long',
      EMAIL_CHANGE_TOKEN_SECRET: 'test-email-change-secret-at-least-32-chars',
      BCRYPT_ROUNDS: '4', // For fast testing (less secure than production)
      MONGO_URI: 'mongodb://localhost:27017/chat-test?replicaSet=rs0',
      // Dummy keys so env validation passes at boot; no test calls a live API.
      LLM_PROVIDER: 'openai',
      OPENAI_API_KEY: 'sk-test-key',
      ANTHROPIC_API_KEY: 'sk-ant-test-key',
      VOYAGE_API_KEY: 'pa-test-key',
      // Dummy avatar-storage config so env validation passes at boot; unit tests
      // mock ObjectStorage, so no test constructs a real client or hits a provider.
      STORAGE_PUBLIC_BASE_URL: 'https://cdn.test.example',
      STORAGE_S3_REGION: 'auto',
      STORAGE_S3_ACCESS_KEY_ID: 'test-access-key',
      STORAGE_S3_SECRET_ACCESS_KEY: 'test-secret-key',
      STORAGE_S3_BUCKET: 'test-avatars',
    },
  },
})
