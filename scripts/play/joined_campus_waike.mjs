#!/usr/bin/env node
/**
 * Same-job browser: built MLV Home → Campus → built WAIKE reader.
 * Serves both apps on loopback. Does not deploy. Does not open learn.gunnchos.com.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = process.cwd();
const MLV_PORT = 4173;
const WAIKE_PORT = 4174;
const MLV_URL = `http://127.0.0.1:${MLV_PORT}/`;
const WAIKE_URL = `http://127.0.0.1:${WAIKE_PORT}/?return=${encodeURIComponent('https://gunnchos.com')}`;
const OUT = join(ROOT, 'artifacts/play/JOINED_CAMPUS_WAIKE.json');
const DRAFT = 'Joined Campus preview draft for Networking week 2. No personal data.';
const children = [];

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (result.status !== 0) throw new Error(`${cmd} ${args.join(' ')} exited ${result.status}`);
}

async function waitHttp(url, ms = 90_000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* still starting */
    }
    await sleep(400);
  }
  throw new Error(`timed out waiting for ${url}`);
}

function startPreview(cwd, port, label) {
  const child = spawn('pnpm', ['exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd,
    stdio: 'ignore',
    env: process.env,
  });
  children.push(child);
  child.on('exit', (code) => {
    if (code && code !== 0) console.error(`${label} preview exited ${code}`);
  });
  return child;
}

function loadPlaywright() {
  const pwRoot = join(tmpdir(), 'mlv-joined-playwright');
  mkdirSync(pwRoot, { recursive: true });
  if (!existsSync(join(pwRoot, 'node_modules/playwright'))) {
    run('npm', ['install', '--prefix', pwRoot, 'playwright@1.49.1']);
  }
  const bin = join(pwRoot, 'node_modules/.bin/playwright');
  run(bin, ['install', 'chromium']);
  return createRequire(join(pwRoot, 'package.json'))('playwright');
}

async function main() {
  const waikeRoot = join(ROOT, 'waike-reader');
  if (!existsSync(join(waikeRoot, 'apps/client/package.json'))) {
    throw new Error('waike-reader checkout missing; CI must check out gunnchos-waike-learning-platform first');
  }
  const mlvDist = join(ROOT, 'apps/mlv-web/dist/index.html');
  const waikeDist = join(waikeRoot, 'apps/client/dist/index.html');
  if (!existsSync(mlvDist)) throw new Error('MLV dist missing; build before this script');
  if (!existsSync(waikeDist)) throw new Error('WAIKE dist missing; build before this script');

  const html = (await import('node:fs')).readFileSync(waikeDist, 'utf8');
  if (!html.includes('id="waike-public-tracks"')) throw new Error('built WAIKE HTML has no track list');
  if (!html.includes('Networking and Internet Infrastructure')) throw new Error('built WAIKE HTML missing Networking track');

  const { chromium } = loadPlaywright();
  startPreview(join(ROOT, 'apps/mlv-web'), MLV_PORT, 'mlv');
  startPreview(join(waikeRoot, 'apps/client'), WAIKE_PORT, 'waike');
  await waitHttp(MLV_URL);
  await waitHttp(`http://127.0.0.1:${WAIKE_PORT}/`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(MLV_URL, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Enter local test identity' }).click();
    await page.getByRole('button', { name: 'Home' }).click();
    await page.waitForFunction(() => /home-yard/.test(window.location.hash));
    await page.evaluate(() => {
      window.location.hash = '#/mlv/campus';
    });
    await page.waitForSelector('[data-testid="campus-waike-reader"]');
    const readerHref = await page.getAttribute('[data-testid="campus-waike-reader"]', 'href');
    if (!readerHref || readerHref.includes('learn.gunnchos.com')) {
      throw new Error(`Campus pointed at ${readerHref}`);
    }
    if (!readerHref.includes('127.0.0.1') || !readerHref.includes('return=https%3A%2F%2Fgunnchos.com')) {
      throw new Error(`Campus href rejected: ${readerHref}`);
    }

    await page.getByTestId('campus-waike-reader').click();
    await page.waitForURL((url) => url.port === String(WAIKE_PORT));
    await page.waitForSelector('#waike-public-tracks');
    await page.locator('#waike-public-tracks a[href="#/learn/NETWORKING_INFRA/1"]').click();
    await page.waitForSelector('#reader-unit');
    await page.selectOption('#reader-unit', '2');
    await page.waitForSelector('[data-testid="full-lesson-content"]');
    const lesson = await page.textContent('[data-testid="full-lesson-content"]');
    if (!/CIDR as a land survey/i.test(lesson || '')) {
      throw new Error('Networking week 2 lesson did not open');
    }
    const returnHref = await page.getAttribute('[data-testid="campus-return"]', 'href');
    if (returnHref !== 'https://gunnchos.com') throw new Error(`return ${returnHref}`);

    await page.locator('label:has-text("Save practice on this browser") input[type="checkbox"]').check();
    await page.locator('textarea').fill(DRAFT);
    await page.getByRole('button', { name: 'Save draft on this device' }).click();
    await page.waitForFunction(() => /Saved on this browser/.test(document.body.innerText));

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#reader-unit');
    await page.selectOption('#reader-unit', '2');
    await page.waitForSelector('textarea');
    const restored = await page.inputValue('textarea');
    if (restored !== DRAFT) throw new Error(`draft not restored: ${JSON.stringify(restored)}`);
    const returnAgain = await page.getAttribute('[data-testid="campus-return"]', 'href');
    if (returnAgain !== 'https://gunnchos.com') throw new Error(`return after reload ${returnAgain}`);

    const shellCheck = await page.evaluate(() => {
      // Public shell constant is proven in node tests; here assert the served HTML is tracks, not a shell.
      return {
        hasTracks: Boolean(document.getElementById('waike-public-tracks')),
        title: document.title,
      };
    });
    if (!shellCheck.hasTracks) throw new Error('served reader lost the track list');

    mkdirSync(join(ROOT, 'artifacts/play'), { recursive: true });
    const payload = {
      ok: true,
      joinedBrowserExecuted: true,
      publicCampusActivated: false,
      pointsAtLearnHost: false,
      mlvUrl: MLV_URL,
      waikeUrl: WAIKE_URL,
      lesson: 'NETWORKING_INFRA/2',
      returnTo: 'https://gunnchos.com',
      draftRestored: true,
    };
    writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
    console.log(JSON.stringify(payload));
  } finally {
    await browser.close();
    for (const child of children) {
      try {
        child.kill('SIGTERM');
      } catch {
        /* already gone */
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  for (const child of children) {
    try {
      child.kill('SIGTERM');
    } catch {
      /* ignore */
    }
  }
  process.exit(1);
});
