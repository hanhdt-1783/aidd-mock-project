import { defineConfig } from 'vitest/config';

// Unit tests target pure logic (no DOM, no React rendering) — the Node
// environment is sufficient and fastest. Component/E2E tests are out of scope.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'app/**/*.test.ts'],
  },
});
