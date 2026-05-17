import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Default '/' for dev/test/preview/Playwright; the Pages deploy workflow
  // sets VITE_BASE=/canopee/ so assets resolve under the project page.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react()],
  resolve: {
    alias: { '@': resolve(import.meta.dirname, 'src') },
  },
  test: {
    // Vitest 4 replaced environmentMatchGlobs with per-project config:
    // pure logic (*.test.ts) runs in fast node, component tests
    // (*.test.tsx) get jsdom + the testing-library setup.
    projects: [
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['src/test/setup.ts'],
        },
      },
    ],
  },
});
