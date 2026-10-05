import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'apps/mlv-web/dist');
const failures = [];

function arg(flag) {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function fail(message) {
  failures.push(message);
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${bytes} B`;
}

// The repo-native command validates the production root build by default.
// Pages callers still pass --base /3k-mlv/ explicitly after a Pages build.
const expectBase = arg('--base') || '/';
const base = expectBase.endsWith('/') ? expectBase : `${expectBase}/`;
const rootHosting = base === '/';

const wranglerPath = path.join(root, 'wrangler.jsonc');
const wrangler = JSON.parse(fs.readFileSync(wranglerPath, 'utf8').replace(/^\s*\/\/.*$/gm, ''));
if (wrangler.assets?.directory !== './apps/mlv-web/dist') {
  fail(`wrangler assets.directory is ${wrangler.assets?.directory}`);
}
if (wrangler.assets?.not_found_handling !== 'single-page-application') {
  fail('wrangler SPA not_found_handling is missing');
}
if (wrangler.main) {
  fail('wrangler config unexpectedly requires a Worker entrypoint');
}

const indexPath = path.join(dist, 'index.html');
if (!fs.existsSync(indexPath)) {
  fail('apps/mlv-web/dist/index.html is missing');
} else {
  const html = fs.readFileSync(indexPath, 'utf8');
  const refs = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((match) => match[1]);
  const builtRefs = refs.filter((ref) => ref.includes('/assets/') || ref.endsWith('.js') || ref.endsWith('.css'));
  if (builtRefs.length === 0) fail('index.html has no built JS/CSS references');
  if (rootHosting) {
    if (html.includes('/3k-mlv/')) fail('root index.html still uses /3k-mlv/ asset prefixes');
    for (const ref of builtRefs) {
      if (!ref.startsWith('/') || ref.startsWith('/3k-mlv/')) fail(`root asset ref ${ref}`);
    }
  } else {
    if (!html.includes('/3k-mlv/')) fail('GitHub Pages index.html is missing /3k-mlv/ asset prefixes');
    for (const ref of builtRefs) {
      if (!ref.startsWith('/3k-mlv/')) fail(`Pages asset ref ${ref}`);
    }
  }
}

const files = walk(dist);
const js = files.filter((file) => file.endsWith('.js'));
const css = files.filter((file) => file.endsWith('.css'));
if (js.length === 0) fail('expected JS assets are missing from dist');
if (css.length === 0) fail('expected CSS assets are missing from dist');

const pwaNames = /^(sw\.js|registerSW\.js|manifest\.webmanifest|manifest\.json|workbox-.*\.js)$/;
const pwaFiles = files.filter((file) => pwaNames.test(path.basename(file)));
const pwaText = pwaFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
if (pwaFiles.length === 0) fail('PWA service worker or manifest was not emitted');
if (rootHosting) {
  if (pwaText.includes('/3k-mlv/')) fail('root PWA still contains /3k-mlv/ scope, start URL, or cache references');
} else if (!pwaText.includes('/3k-mlv/')) {
  fail('GitHub Pages PWA is missing /3k-mlv/ scope or cache references');
}

const manifestPath = pwaFiles.find((file) => file.endsWith('.webmanifest') || path.basename(file) === 'manifest.json');
if (!manifestPath) {
  fail('PWA manifest is missing');
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const scope = manifest.scope || '';
  const startUrl = manifest.start_url || '';
  if (rootHosting) {
    if (scope.includes('3k-mlv') || startUrl.includes('3k-mlv')) {
      fail(`stale PWA scope/start_url scope=${scope} start_url=${startUrl}`);
    }
    if (scope && scope !== '/' && scope !== './') fail(`unexpected root PWA scope ${scope}`);
  } else if (!scope.includes('/3k-mlv/') || !startUrl.includes('/3k-mlv/')) {
    fail(`Pages PWA scope/start_url scope=${scope} start_url=${startUrl}`);
  }
}

const stats = files
  .map((file) => ({ file: path.relative(dist, file), bytes: fs.statSync(file).size }))
  .sort((a, b) => b.bytes - a.bytes);
const total = stats.reduce((sum, item) => sum + item.bytes, 0);
const largestGlb = stats.find((item) => /\.(glb|gltf)$/i.test(item.file));
const jsStats = stats.filter((item) => item.file.endsWith('.js'));
const perFileLimit = 25 * 1024 * 1024;
const overLimit = stats.filter((item) => item.bytes > perFileLimit);

console.log(`HOSTING_BASE=${base}`);
console.log(`DIST_BYTES=${total}`);
console.log(`DIST_HUMAN=${formatBytes(total)}`);
console.log(`JS_FILES=${js.length}`);
console.log(`CSS_FILES=${css.length}`);
console.log(`LARGEST_GLB=${largestGlb ? `${largestGlb.file} ${largestGlb.bytes}` : 'none'}`);
console.log(`LARGEST_JS=${jsStats[0] ? `${jsStats[0].file} ${jsStats[0].bytes}` : 'none'}`);
console.log('LARGEST_20:');
for (const item of stats.slice(0, 20)) {
  console.log(`  ${formatBytes(item.bytes).padStart(10)}  ${item.file}`);
}
if (overLimit.length) {
  fail(`Cloudflare per-file asset limit exceeded: ${overLimit.map((item) => item.file).join(', ')}`);
}

if (failures.length) {
  console.error(failures.map((message) => `FAIL: ${message}`).join('\n'));
  process.exit(1);
}
console.log('OK: hosting output matches the requested base');
