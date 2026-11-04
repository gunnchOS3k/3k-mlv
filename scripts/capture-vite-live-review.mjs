#!/usr/bin/env node
/**
 * Live Vite review capture for campus WORLD views.
 * Starts `pnpm --filter mlv-web dev`, screenshots selected campus hashes via Chromium.
 * Does NOT set PIXEL_* or HUMAN_* gates true — live capture ≠ Pixel fidelity pass.
 */
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'artifacts/fidelity/review_build/vite_live');
mkdirSync(outDir, { recursive: true });

const PORT = Number(process.env.MLV_VITE_PORT || 3011);
const BASE = `http://127.0.0.1:${PORT}/3k-mlv/`;
const CAMPUS_SLUGS = ['gary', 'ghana', 'gaza', 'geelong', 'germany', 'guyana', 'graham-land'];

function shaFile(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

async function waitForServer(url, attempts = 60) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status > 0) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

const viteOk = existsSync(join(root, 'node_modules/.bin/vite'))
  || existsSync(join(root, 'apps/mlv-web/node_modules/.bin/vite'));
if (!viteOk) {
  const report = {
    attempted: true,
    ok: false,
    reason: 'vite_deps_missing',
    gates: { BROWSER_LIVE_VITE_CAPTURE: false, PIXEL_7GC_CAMPUS_PASS: false, HUMAN_7GC_SPATIAL_FIDELITY_PASS: false },
  };
  writeFileSync(join(outDir, 'VITE_LIVE_CAPTURE.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  process.exit(2);
}

const child = spawn(
  'pnpm',
  ['--filter', 'mlv-web', 'exec', 'vite', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
  {
    cwd: root,
    env: { ...process.env, BROWSER: 'none' },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  },
);

let bootLog = '';
child.stdout.on('data', (d) => { bootLog += d.toString(); });
child.stderr.on('data', (d) => { bootLog += d.toString(); });

const ready = await waitForServer(BASE);
if (!ready) {
  try { process.kill(-child.pid, 'SIGTERM'); } catch { child.kill('SIGTERM'); }
  const report = {
    attempted: true,
    ok: false,
    reason: 'vite_server_not_ready',
    bootLogTail: bootLog.slice(-2000),
    gates: { BROWSER_LIVE_VITE_CAPTURE: false, PIXEL_7GC_CAMPUS_PASS: false, HUMAN_7GC_SPATIAL_FIDELITY_PASS: false },
  };
  writeFileSync(join(outDir, 'VITE_LIVE_CAPTURE.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  process.exit(3);
}

const shots = [];
const chromeCandidates = [
  join(process.env.HOME || '', 'Library/Caches/ms-playwright/chromium-1193/chrome-mac/Chromium.app/Contents/MacOS/Chromium'),
  join(process.env.HOME || '', 'Library/Caches/ms-playwright/chromium-1148/chrome-mac/Chromium.app/Contents/MacOS/Chromium'),
].filter((c) => existsSync(c));

let method = null;
let captureError = null;

const preferChromium = process.env.MLV_CAPTURE_CHROMIUM_FIRST === '1' && chromeCandidates.length > 0;

try {
  if (preferChromium) throw new Error('prefer_cached_chromium');
  const { chromium } = await import('playwright');
  method = 'playwright-chromium';
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  // Auth gate blocks campus routes without Supabase; use local test identity only.
  await page.goto(`${BASE}#/mlv/campus/gary`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  try {
    const localId = page.getByRole('button', { name: /Enter local test identity/i });
    await localId.waitFor({ timeout: 10000 });
    await localId.click();
    await page.waitForTimeout(1500);
  } catch {
    /* already signed in or button absent */
  }
  for (const slug of CAMPUS_SLUGS) {
    const url = `${BASE}#/mlv/campus/${slug}`;
    // Hash must be in the navigation URL so the SPA boots on the campus route.
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.evaluate((hash) => {
      if (window.location.hash !== hash) {
        window.location.hash = hash;
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      }
    }, `#/mlv/campus/${slug}`);
    // Re-assert local identity if auth gate reappears after navigation.
    try {
      const localId = page.getByRole('button', { name: /Enter local test identity/i });
      if (await localId.isVisible({ timeout: 800 })) {
        await localId.click();
        await page.waitForTimeout(800);
      }
    } catch { /* ok */ }
    // Allow SPA + R3F; do not claim Pixel fidelity. Avoid networkidle (Vite HMR).
    try {
      await page.waitForSelector(`[data-campus-slug="${slug}"]`, { timeout: 20000 });
    } catch { /* continue with timed wait */ }
    try {
      await page.waitForSelector('canvas', { timeout: 8000 });
    } catch { /* canvas optional in headless */ }
    await page.waitForTimeout(3500);
    const path = join(outDir, `vite-${slug}.png`);
    await page.screenshot({ path, fullPage: false });
    shots.push({ slug, path: `vite-${slug}.png`, sha256: shaFile(path), url });
  }
  await browser.close();
} catch (err) {
  captureError = String(err?.message || err);
  // Fallback: cached Chromium headless per campus (first page only if playwright missing)
  if (chromeCandidates.length) {
    method = 'cached-chromium-headless';
    for (const slug of CAMPUS_SLUGS) {
      const path = join(outDir, `vite-${slug}.png`);
      const url = `${BASE}#/mlv/campus/${slug}`;
      const cli = spawnSync(
        chromeCandidates[0],
        [
          '--headless=new',
          '--disable-gpu',
          '--hide-scrollbars',
          '--window-size=1280,900',
          `--screenshot=${path}`,
          '--virtual-time-budget=8000',
          url,
        ],
        { encoding: 'utf8' },
      );
      if (cli.status === 0 && existsSync(path)) {
        shots.push({ slug, path: `vite-${slug}.png`, sha256: shaFile(path), url });
      }
    }
  }
}

try { process.kill(-child.pid, 'SIGTERM'); } catch { try { child.kill('SIGTERM'); } catch { /* ignore */ } }
try { process.kill(-child.pid, 'SIGKILL'); } catch { try { child.kill('SIGKILL'); } catch { /* ignore */ } }

const distinctShotShaCount = new Set(shots.map((s) => s.sha256)).size;
const report = {
  schema: 'mlv_vite_live_review_v1',
  generated_at: new Date().toISOString(),
  attempted: true,
  ok: shots.length >= 3,
  method,
  base: BASE,
  shots,
  distinctShotShaCount,
  captureError,
  note: 'Live Vite screenshots of campus hash routes after local test identity (no Supabase). Schematic planning twins only — NOT Pixel framebuffers; HUMAN/PIXEL remain false. Identical SHA across shots means SPA/hash/auth capture was non-differentiated.',
  gates: {
    BROWSER_LIVE_VITE_CAPTURE: shots.length >= 3,
    BROWSER_LIVE_VITE_DIFFERENTIATED: distinctShotShaCount > 1,
    PIXEL_7GC_CAMPUS_PASS: false,
    HUMAN_7GC_SPATIAL_FIDELITY_PASS: false,
    HUMAN: false,
    RC2: false,
    V1: false,
  },
};
writeFileSync(join(outDir, 'VITE_LIVE_CAPTURE.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  ok: report.ok,
  method,
  shotCount: shots.length,
  outDir,
  gates: report.gates,
}, null, 2));
process.exit(report.ok ? 0 : 1);
