import { defineConfig } from 'vitest/config';
import { searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pwaPlugin } from './scripts/pwa-plugin';

const nodeModulesPath = fileURLToPath(new URL('./node_modules', import.meta.url));
const fsAllow = [
  searchForWorkspaceRoot(process.cwd()),
  ...(existsSync(nodeModulesPath) ? [realpathSync(nodeModulesPath)] : []),
];

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), pwaPlugin()],
  base: './',
  server: {
    fs: {
      allow: fsAllow,
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
