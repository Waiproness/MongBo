import { build } from 'vite';
import { cp, mkdir, rm } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
await build({ root });
await build({ root, configFile: resolve(root, 'vite.content.config.ts') });
const extensionDir = resolve(root, 'dist/extension');
if (dirname(extensionDir) !== resolve(root, 'dist')) throw new Error('Extension output must stay inside dist');
await rm(extensionDir, { recursive: true, force: true });
await mkdir(extensionDir, { recursive: true });
// Hosting-only files are invalid inside a Chromium extension.
await cp(resolve(root, 'dist/site'), extensionDir, {
  recursive: true,
  filter: source => !['_headers', '_redirects', 'downloads'].includes(basename(source)),
});
await cp(resolve(root, 'extension'), resolve(root, 'dist/extension'), { recursive: true });
await cp(resolve(root, 'dist/content/content.js'), resolve(root, 'dist/extension/content.js'));
await mkdir(resolve(root, 'dist/site/downloads'), { recursive: true });
// Python's standard zipfile module keeps packaging dependency-free on Windows.
execFileSync('python', [resolve(root, 'scripts/zip_extension.py'), resolve(root, 'dist/extension'), resolve(root, 'dist/site/downloads/mongbo-brave.zip')], { stdio: 'inherit' });
console.log('MongBo ready: dist/site, dist/extension, dist/site/downloads/mongbo-brave.zip');
