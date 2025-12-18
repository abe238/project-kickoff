import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'src/templates'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules',
        'dist',
        'src/templates',
        '**/*.test.ts',
        '**/*.spec.ts',
        'vitest.config.ts',
      ],
    },
    testTimeout: 10000,
  },
});
