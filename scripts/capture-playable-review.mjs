#!/usr/bin/env node
/**
 * Local review-build capture for Gary + Nubuke + Geelong + DE/GY/GL room-bound specialties.
 * Generates static HTML evidence from playable acceptance runners and existing
 * schematic owner-review SVGs. Does NOT set HUMAN_* or PIXEL_* gates true.
 * Optional Playwright screenshots when browsers are available.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'artifacts/fidelity/review_build');
mkdirSync(outDir, { recursive: true });

const {
  runGaryPlayableAcceptance,
  runNubukePlayableAcceptance,
  runGeelongDesignBuildPlayable,
  runGhanaOfflinePlayable,
  runGazaPlayable,
  runGermanySpecialtyPlayable,
  runGuyanaSpecialtyPlayable,
  runGrahamSpecialtyPlayable,
  sceneStateLabel,
  loadLocationRecord,
  PLAYABLE_ACCEPTANCE_NOTE,
} = await import(pathToFileURL(join(root, 'packages/shared/src/campus/index.js')).href);

const gary = runGaryPlayableAcceptance({ learnerId: 'review-alice' });
const nubuke = runNubukePlayableAcceptance({
  learnerId: 'review-alice',
  observation:
    'Garden and gallery relationship teaches climate-responsive gathering without claiming WAIKE occupancy.',
});
const geelong = runGeelongDesignBuildPlayable({ learnerId: 'review-au' });
const parallel = {
  ghana: runGhanaOfflinePlayable({ learnerId: 'review-gh' }),
  gaza: runGazaPlayable({ learnerId: 'review-gz' }),
  germany: runGermanySpecialtyPlayable({ learnerId: 'review-de' }),
  guyana: runGuyanaSpecialtyPlayable({ learnerId: 'review-gy' }),
  graham: runGrahamSpecialtyPlayable({ learnerId: 'review-gl' }),
};

const garyLabel = sceneStateLabel(loadLocationRecord('loc.campus.gary'));
const nubukeLabel = sceneStateLabel(loadLocationRecord('loc.heritage.nubuke'));

function sha(obj) {
  return createHash('sha256').update(JSON.stringify(obj)).digest('hex');
}

const manifest = {
  schema: 'mlv_playable_review_build_v1',
  generated_at: new Date().toISOString(),
  note: 'Local review-build capture. Schematic SVGs are not Pixel framebuffers. HUMAN/PIXEL gates remain false.',
  acceptance_note: PLAYABLE_ACCEPTANCE_NOTE,
  gates: {
    HUMAN_7GC_SPATIAL_FIDELITY_PASS: false,
    HUMAN_LOCAL_IDENTITY_PASS: false,
    HUMAN_CAMPUS_USABILITY_PASS: false,
    PIXEL_7GC_CAMPUS_PASS: false,
    BROWSER_LIVE_CAPTURE: false,
  },
  results: {
    gary: {
      ok: gary.ok,
      nav_only: gary.nav_only,
      rooms: gary.transcript?.map((t) => t.room_key) || [],
      waike_linked: gary.waike_linked,
      private_visibility: gary.private_visibility,
      returned_home: gary.returned_home,
      scene: garyLabel,
    },
    nubuke: {
      ok: nubuke.ok,
      nav_only: nubuke.nav_only,
      not_waike_campus: nubuke.not_waike_campus,
      matched_views: nubuke.matched_views?.map((v) => v.id) || [],
      unknowns: nubuke.evidence_drawer?.unknowns_retained || [],
      private_visibility: nubuke.private_visibility,
      scene: nubukeLabel,
    },
    geelong: {
      ok: geelong.ok,
      nav_only: geelong.nav_only,
      rooms_include_design_build_studio: geelong.rooms_include_design_build_studio,
      transcript: geelong.transcript,
      layer_states: geelong.layer_states,
      private_visibility: geelong.private_visibility,
      returned_home: geelong.returned_home,
    },
    parallel: Object.fromEntries(
      Object.entries(parallel).map(([k, v]) => [k, {
        ok: v.ok,
        nav_only: v.nav_only ?? null,
        returned_home: v.returned_home ?? null,
        rooms_include_industry40_studio: v.rooms_include_industry40_studio ?? null,
        rooms_include_climate_gis: v.rooms_include_climate_gis ?? null,
        rooms_include_satcom_cart: v.rooms_include_satcom_cart ?? null,
        no_fake_station: v.no_fake_station ?? null,
        transcript: v.transcript ?? null,
      }]),
    ),
  },
};
manifest.content_sha256 = sha(manifest.results);

// Copy schematic SVGs for Gary + Ghana(Nubuke campus) + Geelong into review pack
for (const slug of ['gary', 'ghana', 'geelong']) {
  const src = join(root, 'artifacts/campus/v4/owner_review', slug);
  const dest = join(outDir, 'schematic', slug);
  if (existsSync(src)) {
    mkdirSync(dest, { recursive: true });
    for (const view of ['entry', 'program', 'gallery', 'truth']) {
      const f = join(src, `${view}.svg`);
      if (existsSync(f)) cpSync(f, join(dest, `${view}.svg`));
    }
  }
}

writeFileSync(join(outDir, 'REVIEW_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>3k MLV playable review-build — Gary + Nubuke + Geelong + DE/GY/GL</title>
  <style>
    body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 1.5rem; background: #f4f1ea; color: #1c1917; }
    h1,h2,h3 { font-family: Georgia, serif; }
    .kicker { color: #57534e; font-size: 0.95rem; }
    .card { background: #fff; border: 1px solid #d6d3d1; padding: 1rem 1.25rem; margin: 1rem 0; }
    .pass { color: #166534; font-weight: 600; }
    .fail { color: #991b1b; font-weight: 600; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: 0.75rem; }
    img, object { width: 100%; height: auto; background: #e7e5e4; }
    code { font-size: 0.85rem; }
    .badge { display: inline-block; padding: 0.15rem 0.5rem; border: 1px solid #a8a29e; border-radius: 4px; margin-right: 0.35rem; }
  </style>
</head>
<body>
  <h1>3k MLV playable review-build</h1>
  <p class="kicker">${PLAYABLE_ACCEPTANCE_NOTE}</p>
  <p class="kicker">Generated ${manifest.generated_at}. HUMAN/PIXEL gates remain <strong>false</strong>. Schematic SVGs ≠ surveyed architecture.</p>
  <p>
    <span class="badge">Gary ${gary.ok ? 'PASS' : 'FAIL'}</span>
    <span class="badge">Nubuke ${nubuke.ok ? 'PASS' : 'FAIL'}</span>
    <span class="badge">Geelong DB ${geelong.ok ? 'PASS' : 'FAIL'}</span>
  </p>

  <section class="card" id="gary" data-testid="review-gary">
    <h2>Gary campus journey</h2>
    <p class="${gary.ok ? 'pass' : 'fail'}">${gary.ok ? 'PASS' : 'FAIL'} · nav_only=${String(gary.nav_only)} · returned_home=${String(gary.returned_home)}</p>
    <p class="kicker">${garyLabel?.label || ''} · ${garyLabel?.capture || ''}</p>
    <ol>${(gary.transcript || []).map((t) => `<li><code>${t.room_key}</code> — ${t.step_id} · WAIKE ${t.waike_surface}</li>`).join('')}</ol>
    <div class="grid">
      <figure><object type="image/svg+xml" data="schematic/gary/entry.svg" aria-label="Gary entry schematic"></object><figcaption>entry schematic</figcaption></figure>
      <figure><object type="image/svg+xml" data="schematic/gary/program.svg" aria-label="Gary program schematic"></object><figcaption>program schematic</figcaption></figure>
      <figure><object type="image/svg+xml" data="schematic/gary/truth.svg" aria-label="Gary truth schematic"></object><figcaption>truth schematic</figcaption></figure>
    </div>
  </section>

  <section class="card" id="nubuke" data-testid="review-nubuke">
    <h2>Nubuke heritage (Gallery / Campus)</h2>
    <p class="${nubuke.ok ? 'pass' : 'fail'}">${nubuke.ok ? 'PASS' : 'FAIL'} · not_waike_campus=${String(nubuke.not_waike_campus)} · metric=${nubuke.metric_accuracy_status}</p>
    <p class="kicker">${nubukeLabel?.label || ''} · ${nubukeLabel?.capture || ''}</p>
    <ul>${(nubuke.matched_views || []).map((v) => `<li>${v.title} · ${v.model_status}</li>`).join('')}</ul>
    <p class="kicker">Unknowns retained: ${(nubuke.evidence_drawer?.unknowns_retained || []).join(', ')}</p>
    <div class="grid">
      <figure><object type="image/svg+xml" data="schematic/ghana/gallery.svg" aria-label="Ghana/Nubuke gallery schematic"></object><figcaption>ghana gallery schematic</figcaption></figure>
      <figure><object type="image/svg+xml" data="schematic/ghana/truth.svg" aria-label="Ghana truth schematic"></object><figcaption>truth schematic</figcaption></figure>
    </div>
  </section>

  <section class="card" id="geelong" data-testid="review-geelong">
    <h2>Geelong design / build room wiring</h2>
    <p class="${geelong.ok ? 'pass' : 'fail'}">${geelong.ok ? 'PASS' : 'FAIL'} · DESIGN_BUILD_STUDIO bound=${String(geelong.rooms_include_design_build_studio)}</p>
    <ol>${(geelong.transcript || []).map((t) => `<li><code>${t.room_key}</code> (${t.phase_hint}) — ${t.step_id}</li>`).join('')}</ol>
    <p class="kicker">Layer states: ${(geelong.layer_states || []).join(' · ')}</p>
    <div class="grid">
      <figure><object type="image/svg+xml" data="schematic/geelong/program.svg" aria-label="Geelong program schematic"></object><figcaption>program schematic</figcaption></figure>
      <figure><object type="image/svg+xml" data="schematic/geelong/gallery.svg" aria-label="Geelong gallery schematic"></object><figcaption>gallery schematic</figcaption></figure>
    </div>
  </section>

  <section class="card">
    <h2>Parallel specialty playables</h2>
    <ul>
      ${Object.entries(parallel).map(([k, v]) => `<li>${k}: <span class="${v.ok ? 'pass' : 'fail'}">${v.ok ? 'PASS' : 'FAIL'}</span></li>`).join('')}
    </ul>
  </section>

  <p class="kicker">Manifest SHA256 (results): <code>${manifest.content_sha256}</code></p>
</body>
</html>
`;
writeFileSync(join(outDir, 'index.html'), html);

// Optional Playwright screenshot of the static review page
let browserCapture = { attempted: false, ok: false, reason: null, shots: [] };
try {
  const { chromium } = await import('playwright');
  browserCapture.attempted = true;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
  await page.goto(pathToFileURL(join(outDir, 'index.html')).href, { waitUntil: 'load' });
  for (const [name, sel] of [
    ['gary', '#gary'],
    ['nubuke', '#nubuke'],
    ['geelong', '#geelong'],
    ['full', 'body'],
  ]) {
    const path = join(outDir, `shot-${name}.png`);
    if (sel === 'body') await page.screenshot({ path, fullPage: true });
    else await page.locator(sel).screenshot({ path });
    browserCapture.shots.push(`shot-${name}.png`);
  }
  await browser.close();
  browserCapture.ok = true;
  manifest.gates.BROWSER_LIVE_CAPTURE = true;
  writeFileSync(join(outDir, 'REVIEW_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
} catch (err) {
  browserCapture.reason = String(err?.message || err);
  const chromeCandidates = [
    join(process.env.HOME || '', 'Library/Caches/ms-playwright/chromium-1193/chrome-mac/Chromium.app/Contents/MacOS/Chromium'),
    join(process.env.HOME || '', 'Library/Caches/ms-playwright/chromium-1148/chrome-mac/Chromium.app/Contents/MacOS/Chromium'),
  ].filter((c) => existsSync(c));
  let captured = false;
  for (const chrome of chromeCandidates) {
    const shot = join(outDir, 'shot-full.png');
    const cli = spawnSync(
      chrome,
      ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1280,2400', `--screenshot=${shot}`, '--virtual-time-budget=5000', pathToFileURL(join(outDir, 'index.html')).href],
      { encoding: 'utf8' },
    );
    if (cli.status === 0 && existsSync(shot)) {
      browserCapture.attempted = true;
      browserCapture.ok = true;
      browserCapture.shots.push('shot-full.png');
      browserCapture.method = 'cached-chromium-headless-screenshot';
      browserCapture.reason = null;
      manifest.gates.BROWSER_LIVE_CAPTURE = false;
      manifest.gates.BROWSER_REVIEW_HTML_CAPTURE = true;
      writeFileSync(join(outDir, 'REVIEW_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
      captured = true;
      break;
    }
  }
  if (!captured) {
    const cli = spawnSync(
      'playwright',
      ['screenshot', '--viewport-size=1280,1600', pathToFileURL(join(outDir, 'index.html')).href, join(outDir, 'shot-full-cli.png')],
      { encoding: 'utf8' },
    );
    if (cli.status === 0) {
      browserCapture.attempted = true;
      browserCapture.ok = true;
      browserCapture.shots.push('shot-full-cli.png');
      browserCapture.reason = 'playwright CLI screenshot';
      manifest.gates.BROWSER_REVIEW_HTML_CAPTURE = true;
      writeFileSync(join(outDir, 'REVIEW_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    } else {
      browserCapture.reason = `${browserCapture.reason}; cli=${cli.stderr || cli.stdout || cli.status}`;
    }
  }
}

writeFileSync(join(outDir, 'BROWSER_CAPTURE.json'), `${JSON.stringify(browserCapture, null, 2)}\n`);

const allOk = gary.ok && nubuke.ok && geelong.ok && Object.values(parallel).every((v) => v.ok);
console.log(JSON.stringify({
  outDir,
  allOk,
  browserCapture,
  content_sha256: manifest.content_sha256,
}, null, 2));
process.exit(allOk ? 0 : 1);
