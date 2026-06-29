import { defineConfig } from 'vitest/config';

// スモークテスト用。fake-indexeddb で IndexedDB を Node 上に再現し、
// Dexie 実装（LocalRepository）を put → getById で検証する。
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
  },
});
