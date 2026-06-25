import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'backend/**/*.test.js',
      'frontend/src/**/*.test.js',
      'shared/**/*.test.js',
    ],
    environment: 'node',
    clearMocks: true,
  },
});
