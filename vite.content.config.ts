import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  build: { outDir: 'dist/content', emptyOutDir: true,
    lib: { entry: resolve(import.meta.dirname, 'src/extension/content.ts'), name: 'MongBoContent', formats: ['iife'], fileName: () => 'content.js' },
  },
});
