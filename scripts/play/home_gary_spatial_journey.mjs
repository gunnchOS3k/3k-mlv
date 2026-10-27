#!/usr/bin/env node
/**
 * Built-app spatial evidence: Home → Commons → Gary exterior/lobby/classroom
 * → in-app WAIKE workstation action → return with state preserved.
 * Screenshots + JSON on free GitHub runners / local Playwright Chromium.
 * Does not deploy. Does not open learn.gunnchos.com. Does not flip human gates.
 */
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';

const ROOT = process.cwd();
const MLV_PORT = 4173;
const MLV_URL = `http://127.0.0.1:${MLV_PORT}/`;
const SHOTS = join(ROOT, 'artifacts/play/spatial_home_gary/screenshots');
const OUT = join(ROOT, 'artifacts/play/spatial_home_gary/HOME_GARY_SPATIAL_JOURNEY.json');
const CLASS_DRAFT = 'Gary classroom private draft for Networking unit 2. No personal data.';
const HOME_DRAFT = 'Home office private desk notes. Stay on this device.';
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

function startPreview() {
  const child = spawn('pnpm', ['exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', String(MLV_PORT), '--strictPort'], {
    cwd: join(ROOT, 'apps/mlv-web'),
    stdio: 'ignore',
    env: process.env,
  });
  children.push(child);
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

async function shot(page, name) {
  const path = join(SHOTS, `${name}.png`);
  await page.screenshot({ path, fullPage: true });
  return path;
}

async function waitScene(page, sceneId) {
  await page.waitForFunction(
    (id) => window.location.hash.includes(`/scene/${id}`) || document.querySelector(`[data-scene-id="${id}"]`),
    sceneId,
    { timeout: 20_000 },
  );
}

async function goScene(page, sceneId) {
  await page.evaluate((id) => {
    window.location.hash = `#/mlv/scene/${id}`;
  }, sceneId);
  await waitScene(page, sceneId);
}

async function listActivate(page, labelSubstring) {
  await page.getByRole('button', { name: 'LIST', exact: true }).click();
  await page.getByRole('button', { name: new RegExp(labelSubstring, 'i') }).first().click();
}

async function main() {
  const mlvDist = join(ROOT, 'apps/mlv-web/dist/index.html');
  if (!existsSync(mlvDist)) throw new Error('MLV dist missing; build before this script');

  mkdirSync(SHOTS, { recursive: true });
  const { chromium } = loadPlaywright();
  startPreview();
  await waitHttp(MLV_URL);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const shots = [];
  const actions = [];

  try {
    await page.goto(MLV_URL, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Enter local test identity' }).click();
    actions.push('authenticated_local_test_identity');

    await page.getByRole('button', { name: 'Home' }).click();
    await waitScene(page, 'home-yard');
    shots.push(await shot(page, '01_home_yard'));
    actions.push('entered_home_yard');

    await goScene(page, 'home-living');
    shots.push(await shot(page, '02_home_living'));
    await goScene(page, 'home-bedroom');
    shots.push(await shot(page, '03_home_bedroom'));
    await goScene(page, 'home-media');
    shots.push(await shot(page, '04_home_media'));
    await goScene(page, 'home-office');
    shots.push(await shot(page, '05_home_office'));
    actions.push('walked_home_rooms');

    await listActivate(page, 'Private file workbench');
    await page.waitForSelector('[data-testid="home-private-workbench"]');
    await page.getByTestId('home-workbench-draft').fill(HOME_DRAFT);
    await page.getByTestId('home-workbench-save').click();
    await page.waitForSelector('[data-testid="home-workbench-status"]');
    shots.push(await shot(page, '06_home_office_workbench'));
    actions.push('saved_private_home_office_notes');

    await goScene(page, 'commons');
    shots.push(await shot(page, '07_commons'));
    actions.push('returned_commons');

    await goScene(page, 'transit');
    shots.push(await shot(page, '08_transit'));
    await goScene(page, 'gary-arrival');
    shots.push(await shot(page, '09_gary_exterior'));
    await goScene(page, 'gary-lobby');
    shots.push(await shot(page, '10_gary_lobby'));
    await goScene(page, 'gary-learning');
    shots.push(await shot(page, '11_gary_classroom'));
    actions.push('reached_gary_classroom');

    await listActivate(page, 'WAIKE classroom workstation');
    await page.waitForURL(/#\/mlv\/academic\/courses/);
    await page.waitForSelector('[data-testid="classroom-workstation"]');
    shots.push(await shot(page, '12_classroom_workstation'));

    const learnHrefs = await page.evaluate(() =>
      [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') || '').filter((href) => /learn\.gunnchos\.com/i.test(href)),
    );
    if (learnHrefs.length) throw new Error(`Campus pointed at learn host: ${learnHrefs.join(', ')}`);
    const reader = page.locator('[data-testid="campus-waike-reader"]');
    if (await reader.count()) {
      const href = await reader.getAttribute('href');
      if (href && href.includes('learn.gunnchos.com')) {
        throw new Error(`Campus pointed at ${href}`);
      }
    }

    await page.getByTestId('classroom-track').selectOption('NETWORKING_INFRA');
    await page.getByTestId('classroom-draft').fill(CLASS_DRAFT);
    await page.getByTestId('classroom-save').click();
    await page.waitForFunction(() => /Private classroom draft saved/i.test(document.body.innerText));
    actions.push('authenticated_classroom_learning_action');

    const returnHref = await page.getAttribute('[data-testid="classroom-return-world"]', 'href');
    if (!returnHref || !returnHref.includes('gary-learning')) {
      throw new Error(`classroom return missing gary-learning: ${returnHref}`);
    }
    await page.getByTestId('classroom-return-world').click();
    await waitScene(page, 'gary-learning');
    shots.push(await shot(page, '13_return_gary_learning'));
    actions.push('returned_gary_learning_with_context');

    await goScene(page, 'commons');
    shots.push(await shot(page, '14_return_commons'));
    await goScene(page, 'home-office');
    await page.getByRole('button', { name: 'LIST', exact: true }).click();
    await page.getByRole('button', { name: /Private file workbench/i }).first().click();
    await page.waitForSelector('[data-testid="home-private-workbench"]');
    const restoredHome = await page.inputValue('[data-testid="home-workbench-draft"]');
    if (restoredHome !== HOME_DRAFT) throw new Error(`home draft not restored: ${JSON.stringify(restoredHome)}`);
    shots.push(await shot(page, '15_home_office_state_preserved'));
    actions.push('home_office_state_preserved');

    await page.evaluate(() => {
      window.location.hash = '#/mlv/academic/courses';
    });
    await page.waitForSelector('[data-testid="classroom-workstation"]');
    const restoredClass = await page.inputValue('[data-testid="classroom-draft"]');
    if (restoredClass !== CLASS_DRAFT) throw new Error(`classroom draft not restored: ${JSON.stringify(restoredClass)}`);
    shots.push(await shot(page, '16_classroom_state_preserved'));
    actions.push('classroom_state_preserved');

    const payload = {
      ok: true,
      journey: 'home_bedroom_office_commons_gary_classroom_return',
      joinedBrowserExecuted: true,
      publicCampusActivated: false,
      pointsAtLearnHost: false,
      humanGatesRemainFalse: true,
      mlvUrl: MLV_URL,
      screenshots: shots.map((path) => path.replace(`${ROOT}/`, '')),
      actions,
      homeDraftRestored: true,
      classroomDraftRestored: true,
      returnScene: 'gary-learning',
      gates: {
        HUMAN_7GC_SPATIAL_FIDELITY_PASS: false,
        HUMAN_LOCAL_IDENTITY_PASS: false,
        HUMAN_CAMPUS_USABILITY_PASS: false,
        RC2_READY: false,
        V1_0_0_RELEASE_AUTHORIZED: false,
      },
      nextCampus: 'ghana',
      note: 'Home+Gary spatial milestone evidence only. Not V1 complete. Authored planning twin; not a physical facility claim.',
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
