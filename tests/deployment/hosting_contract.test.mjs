import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { normalizeViteBasePath } from '../../scripts/vite-base-path.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test('vite base is / unless VITE_BASE_PATH says otherwise', () => {
  assert.equal(normalizeViteBasePath(undefined), '/');
  assert.equal(normalizeViteBasePath('/'), '/');
  assert.equal(normalizeViteBasePath('/3k-mlv/'), '/3k-mlv/');
  assert.equal(normalizeViteBasePath('/3k-mlv'), '/3k-mlv/');
});

test('wrangler config is assets-only SPA', () => {
  const raw = fs.readFileSync(path.join(root, 'wrangler.jsonc'), 'utf8');
  const config = JSON.parse(raw.replace(/^\s*\/\/.*$/gm, ''));
  assert.equal(config.name, '3k-mlv');
  assert.equal(config.compatibility_date, '2026-09-29');
  assert.equal(config.assets.directory, './apps/mlv-web/dist');
  assert.equal(config.assets.not_found_handling, 'single-page-application');
  assert.equal(config.workers_dev, true);
  assert.equal(config.preview_urls, true);
  assert.deepEqual(config.previews, {});
  assert.equal(config.main, undefined);
});

test('vite config and PWA scope follow the deployment base', () => {
  const source = fs.readFileSync(path.join(root, 'apps/mlv-web/vite.config.ts'), 'utf8');
  assert.doesNotMatch(source, /base:\s*['"]\/3k-mlv\/['"]/);
  assert.match(source, /normalizeViteBasePath\(process\.env\.VITE_BASE_PATH\)/);
  assert.match(source, /start_url:\s*base/);
  assert.match(source, /scope:\s*base/);
});

test('GitHub Pages workflow stays on pnpm and /3k-mlv/', () => {
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/pages.yml'), 'utf8');
  assert.match(workflow, /pnpm\/action-setup@v4/);
  assert.match(workflow, /version:\s*9\.15\.9/);
  assert.match(workflow, /run_install:\s*false/);
  assert.match(workflow, /node-version:\s*22/);
  assert.match(workflow, /cache:\s*pnpm/);
  assert.match(workflow, /pnpm install --frozen-lockfile/);
  assert.match(workflow, /pnpm run build/);
  assert.match(workflow, /VITE_BASE_PATH:\s*\/3k-mlv\//);
  assert.match(workflow, /path:\s*apps\/mlv-web\/dist/);
  assert.doesNotMatch(workflow, /(^|\s)npm ci(\s|$)/m);
  assert.doesNotMatch(workflow, /(^|\s)npm run build(\s|$)/m);
});

test('cloudflare check validates without publishing', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  for (const name of ['cloudflare:build', 'cloudflare:deploy', 'cloudflare:preview', 'cloudflare:check']) {
    assert.equal(typeof pkg.scripts[name], 'string');
  }
  const tasks = fs.readFileSync(path.join(root, 'scripts/cloudflare-tasks.mjs'), 'utf8');
  assert.match(tasks, /VITE_BASE_PATH: '\/'/);
  assert.match(tasks, /wrangler', 'deploy', '--dry-run'/);
  const checkBody = tasks.slice(tasks.indexOf('async check()'));
  assert.doesNotMatch(checkBody, /wrangler', 'deploy'\]/);
});
