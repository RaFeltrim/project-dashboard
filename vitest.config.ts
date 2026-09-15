import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/tests/unit/**/*.spec.ts', 'src/tests/**/*.test.ts'],
    globals: true,
  },
});
