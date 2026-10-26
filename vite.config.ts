import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { createReadStream, existsSync } from 'node:fs';
export default defineConfig({
  base: './', plugins: [react(), {
    name: 'local-extension-download',
    configureServer(server) {
      server.middlewares.use('/downloads/', (req, res, next) => {
        const filename = req.url?.split('?')[0]?.replace(/^\//, '');
        if (!filename || !['mongbo-brave.zip', 'mongbo-chromium.zip'].includes(filename)) { next(); return; }
        const archive = resolve(import.meta.dirname, 'dist/site/downloads', filename);
        if (!existsSync(archive)) { res.statusCode = 404; res.end('Extension not built yet'); return; }
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        createReadStream(archive).pipe(res);
      });
    },
  }],
  build: { outDir: 'dist/site', rollupOptions: { input: {
    studio: resolve(import.meta.dirname, 'index.html'),
    popup: resolve(import.meta.dirname, 'popup.html'),
  } } },
});
