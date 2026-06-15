import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: [
      'src/domain/**/*.test.ts',
      'src/lib/**/*.test.ts',
      'src/templates/**/*.test.tsx',
      'scripts/lib/**/*.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
