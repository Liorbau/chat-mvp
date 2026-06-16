import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Test files share one Mongo DB and each resets collections. Run a single
    // worker, sequentially, so files never race on the shared data.
    fileParallelism: false,
    maxWorkers: 1,
    env: {
      JWT_SECRET: 'test-secret-at-least-32-characters-long',
      BCRYPT_ROUNDS: '4', // For fast testing (less secure than production)
      MONGO_URI: 'mongodb://localhost:27017/chat-test?replicaSet=rs0',
    },
  },
})
