#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildCoverage, buildSourceManifest, buildTraceability } from '../packages/shared/src/campus/model.js';
import { evaluateSourceFidelityGates } from '../packages/shared/src/campus/gates.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = buildSourceManifest();
const traceability = buildTraceability(manifest);
const coverage = buildCoverage(manifest);
const fidelity = evaluateSourceFidelityGates(manifest);
const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
const manifestHash = createHash('sha256').update(manifestJson).digest('hex');

function write(rel, body) {
  const abs = join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, typeof body === 'string' ? body : `${JSON.stringify(body, null, 2)}\n`);
  return abs;
}

write('data/campus/7gc-campus-source-manifest.json', manifestJson);
write('artifacts/campus/7GC_CAMPUS_REQUIREMENT_TRACEABILITY.json', traceability);
write('artifacts/campus/7GC_CAMPUS_DIGITAL_TWIN_COVERAGE.json', coverage);
write('artifacts/campus/7GC_CAMPUS_FIDELITY_GATES.json', {
  source_manifest_sha256: manifestHash,
  requirement_counts: fidelity.counts,
  ...fidelity,
});

function captureHtml(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; background: #11181f; color: #f4f1ea; margin: 0; padding: 1.5rem; }
    h1, h2, h3 { margin: 0 0 .5rem; }
    .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    article, section { background: #1c262f; border-radius: 12px; padding: 1rem; }
    .meta { color: #c5bba8; font-size: .9rem; }
    .badge { display: inline-block; background: #2d6a4f; border-radius: 999px; padding: .1rem .5rem; font-size: .75rem; }
    .warn { background: #7c5800; }
  </style>
</head>
<body>
${body}
<p class="meta">Authored planning twin. HUMAN visual gates remain false. PIXEL_7GC_CAMPUS_PASS=false.</p>
</body>
</html>
`;
}

write('artifacts/campus/captures/campus_landing.html', captureHtml('Campus landing', `
  <h1>Campus</h1>
  <div class="grid">
    ${manifest.campus_landing.map((item) => `<article><h2>${item.label}</h2><p class="meta">${item.route}</p></article>`).join('\n')}
  </div>
`));

write('artifacts/campus/captures/atlas.html', captureHtml('7GC Atlas', `
  <h1>7GC Atlas</h1>
  <div class="grid">
    ${manifest.campuses.map((c) => `
      <article>
        <h2>${c.atlas_name}</h2>
        <p>${c.planning_model}</p>
        <p class="meta">${c.local_focus}</p>
        <p><span class="badge">${c.truth_state}</span> · ${c.phases[0].label}</p>
        <p>Enter Digital Campus</p>
      </article>`).join('\n')}
  </div>
`));

for (const campus of manifest.campuses) {
  const rooms = campus.requirements.filter((r) => r.kind === 'ROOM' && r.phase === campus.phases[campus.phases.length - 1].id);
  write(`artifacts/campus/captures/${campus.slug}_overview.html`, captureHtml(`${campus.atlas_name} overview`, `
    <h1>${campus.name}</h1>
    <p>${campus.planning_identity}</p>
    <p class="meta">Layout: ${campus.layout} · geometry: authored planning twin</p>
    <section>
      <h2>Phase selector</h2>
      ${campus.phases.map((p) => `<span class="badge">${p.label}</span> `).join('')}
    </section>
    <div class="grid">
      ${rooms.map((r) => `<article><h3>${r.name}</h3><p class="meta">${r.id}</p><p>${r.function}</p></article>`).join('\n')}
    </div>
  `));
}

const gaza = manifest.campuses.find((c) => c.id === 'GAZA');
write('artifacts/campus/captures/gaza_recovery.html', captureHtml('Gaza recovery node', `
  <h1>${gaza.name}</h1>
  <p>${gaza.planning_identity}</p>
  <p class="badge warn">No sensitive locations. No coordinates.</p>
  <div class="grid">
    ${gaza.requirements.filter((r) => r.phase_token === 'RECOVERY_NETWORK').map((r) => `<article><h3>${r.name}</h3><p>${r.function}</p></article>`).join('\n')}
  </div>
`));

const graham = manifest.campuses.find((c) => c.id === 'GRAHAM');
write('artifacts/campus/captures/graham_land_twin.html', captureHtml('Graham Land twin', `
  <h1>${graham.name}</h1>
  <p>${graham.planning_identity}</p>
  <p class="badge warn">Remote-first digital twin. External station references remain external.</p>
  <div class="grid">
    ${graham.requirements.filter((r) => r.kind === 'SIMULATION_LAYER').map((r) => `<article><h3>${r.name}</h3><p class="meta">${r.evidence_status}</p></article>`).join('\n')}
  </div>
`));

write('artifacts/campus/captures/phase_selector.html', captureHtml('Phase selector', `
  <h1>Phase-aware digital twins</h1>
  ${manifest.campuses.map((c) => `<section><h2>${c.atlas_name}</h2>${c.phases.map((p) => `<span class="badge">${p.id}</span> `).join('')}</section>`).join('\n')}
`));

write('artifacts/campus/captures/evidence_panel.html', captureHtml('Evidence panel', `
  <h1>Evidence / status</h1>
  <section>
    <p>Source: urban planning brief</p>
    <p>Implementation: authored navigable planning twin</p>
    <p>Proposal / simulation / real-data status is explicit. No secrets.</p>
    <p>Limitations: not surveyed architecture; not a claim that physical campuses exist.</p>
  </section>
`));

write('artifacts/campus/CAPTURE_INDEX.json', {
  human_gates_false: true,
  PIXEL_7GC_CAMPUS_PASS: false,
  captures: [
    'campus_landing.html',
    'atlas.html',
    ...manifest.campuses.map((c) => `${c.slug}_overview.html`),
    'phase_selector.html',
    'evidence_panel.html',
    'gaza_recovery.html',
    'graham_land_twin.html',
  ],
});

if (!fidelity.pass) {
  console.error('7GC campus fidelity gates failed', fidelity);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  source_manifest_sha256: manifestHash,
  requirement_count: manifest.requirement_count,
  counts: fidelity.counts,
  gates: fidelity.gates,
}, null, 2));
