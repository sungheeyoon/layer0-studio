import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: [
      'src/domain/**/*.test.ts',
      'src/data/**/*.test.ts',
      'src/lib/**/*.test.ts',
      'src/templates/**/*.test.tsx',
      // `.ts` as well as `.tsx`: not every test under `src/app` renders — the
      // routing/streaming guards are plain source checks.
      'src/app/**/*.test.{ts,tsx}',
      'src/components/**/*.test.tsx',
      'scripts/lib/**/*.test.ts',
    ],
    // The default `node` environment stays the default: only the handful of
    // component tests need a DOM, and they opt in per file with
    // `// @vitest-environment jsdom`. Setup files run in both, so the jsdom
    // polyfills guard on `window` being present.
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
