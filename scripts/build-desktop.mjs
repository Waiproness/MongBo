import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist/desktop-app');
if (dirname(output) !== resolve(root, 'dist')) throw new Error('Desktop build must stay inside dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await build({ configFile: false, root, base: './', publicDir: false, plugins: [react()], build: {
  outDir: resolve(output, 'web'), rollupOptions: { input: { studio: resolve(root, 'index.html'), popup: resolve(root, 'popup.html'), desktop: resolve(root, 'desktop.html') } },
} });
await cp(resolve(root, 'public/fonts'), resolve(output, 'web/fonts'), { recursive: true });
await cp(resolve(root, 'public/favicon.svg'), resolve(output, 'web/favicon.svg'));
await build({ configFile: false, root, publicDir: false, build: { outDir: output, emptyOutDir: false, target: 'node24', minify: false, lib: { entry: resolve(root, 'desktop/state.ts'), formats: ['cjs'], fileName: () => 'state.cjs' } } });
for (const file of ['main.cjs', 'preload.cjs', 'icon.png']) await cp(resolve(root, 'desktop', file), resolve(output, file));
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
await writeFile(resolve(output, 'package.json'), JSON.stringify({ name: 'mongbo-desktop', productName: 'MongBo', version: pkg.version, main: 'main.cjs', private: true }));
if (process.argv.includes('--pack')) {
  if (process.platform !== 'win32' || process.arch !== 'x64') throw new Error('This release builder requires Windows x64');
  const target = resolve(root, 'dist/desktop/MongBo-win32-x64');
  if (dirname(target) !== resolve(root, 'dist/desktop')) throw new Error('Desktop package must stay inside dist/desktop');
  await rm(target, { recursive: true, force: true });
  await cp(resolve(root, 'node_modules/electron/dist'), target, { recursive: true });
  await rename(resolve(target, 'electron.exe'), resolve(target, 'MongBo.exe'));
  await rm(resolve(target, 'resources/default_app.asar'), { force: true });
  await cp(output, resolve(target, 'resources/app'), { recursive: true });
  await cp(resolve(root, 'desktop/README.txt'), resolve(target, 'README.txt'));
  execFileSync('python', [resolve(root, 'scripts/zip_desktop.py'), target, resolve(root, `dist/desktop/MongBo-${pkg.version}-windows-x64.zip`)], { stdio: 'inherit' });
  console.log(`Desktop executable: ${resolve(target, 'MongBo.exe')}`);
}
