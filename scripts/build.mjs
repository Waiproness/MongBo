import { build } from 'vite';
import { cp, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
await build({ root });
await build({ root, configFile: resolve(root, 'vite.content.config.ts') });
await mkdir(resolve(root, 'dist/extension'), { recursive: true });
await cp(resolve(root, 'dist/site'), resolve(root, 'dist/extension'), { recursive: true });
await cp(resolve(root, 'extension'), resolve(root, 'dist/extension'), { recursive: true });
await cp(resolve(root, 'dist/content/content.js'), resolve(root, 'dist/extension/content.js'));
await mkdir(resolve(root, 'dist/site/downloads'), { recursive: true });
// Python's standard zipfile module keeps packaging dependency-free on Windows.
execFileSync('python', [resolve(root, 'scripts/zip_extension.py'), resolve(root, 'dist/extension'), resolve(root, 'dist/site/downloads/mongbo-brave.zip')], { stdio: 'inherit' });
console.log('MongBo ready: dist/site, dist/extension, dist/site/downloads/mongbo-brave.zip');
