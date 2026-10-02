#!/usr/bin/env node
/**
 * Schematic owner-review sheets from the existing V4 scene coordinates.
 * These are not Pixel framebuffers and not surveyed buildings.
 * HUMAN_* and PIXEL_7GC_CAMPUS_PASS stay false.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SLUGS = ['gary', 'ghana', 'guyana', 'geelong', 'germany', 'gaza', 'graham-land'];
const VIEWS = ['aerial', 'street', 'entry', 'program', 'gallery', 'truth', 'grayscale'];

function read(rel) {
  return readFileSync(join(root, rel), 'utf8');
}

function write(rel, body) {
  const abs = join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, body);
}

function parseScenes(src) {
  const scenes = {};
  for (const slug of SLUGS) {
    const marker = `slug: '${slug}'`;
    const start = src.indexOf(marker);
    if (start < 0) throw new Error(`missing scene ${slug}`);
    const next = SLUGS.map((s) => src.indexOf(`slug: '${s}'`, start + marker.length)).filter((i) => i > start);
    const end = next.length ? Math.min(...next) : src.length;
    const block = src.slice(start, end);
    const modules = [];
    for (const line of block.split('\n')) {
      if (!line.includes('kind:')) continue;
      const kind = /kind:\s*'([^']+)'/.exec(line)?.[1];
      const id = /id:\s*'([^']+)'/.exec(line)?.[1];
      const pos = /position:\s*\[([^\]]+)\]/.exec(line)?.[1];
      const size = /size:\s*\[([^\]]+)\]/.exec(line)?.[1];
      if (!kind || !id || !pos || !size) continue;
      const position = pos.split(',').map((n) => Number(n.trim()));
      const dims = size.split(',').map((n) => Number(n.trim()));
      modules.push({ kind, id, position, size: dims, line });
    }
    const zones = [];
    for (const line of block.split('\n')) {
      if (!line.includes('programKey:')) continue;
      const id = /id:\s*'([^']+)'/.exec(line)?.[1];
      const name = /name:\s*'([^']+)'/.exec(line)?.[1];
      const buildingId = /buildingId:\s*'([^']+)'/.exec(line)?.[1];
      if (id && name && buildingId) zones.push({ id, name, buildingId });
    }
    const truth = /truthNote:\s*'([^']+)'/.exec(block)?.[1] || '';
    scenes[slug] = { modules, zones, truth };
  }
  return scenes;
}

function bounds(modules) {
  let minX = Infinity; let maxX = -Infinity; let minZ = Infinity; let maxZ = -Infinity;
  for (const m of modules) {
    minX = Math.min(minX, m.position[0] - m.size[0] / 2);
    maxX = Math.max(maxX, m.position[0] + m.size[0] / 2);
    minZ = Math.min(minZ, m.position[2] - m.size[2] / 2);
    maxZ = Math.max(maxZ, m.position[2] + m.size[2] / 2);
  }
  return { minX, maxX, minZ, maxZ };
}

function fillFor(module, grayscale) {
  if (grayscale) {
    const h = Math.max(0.15, Math.min(0.9, module.size[1] / 5));
    const g = Math.round(210 - h * 140);
    return `rgb(${g},${g},${g})`;
  }
  if (module.kind === 'water') return '#0e7490';
  if (module.kind === 'gallery_hall') return '#78716c';
  if (module.kind === 'truth_label') return '#7f1d1d';
  if (module.kind === 'terrain' || module.kind === 'landscape') return '#4d7c0f';
  if (module.kind === 'solar_canopy') return '#fbbf24';
  if (module.kind === 'polar_module' || module.kind === 'antenna') return '#cbd5e1';
  return '#a8a29e';
}

function planSvg(modules, { grayscale = false, highlightId = '', crop = null, title = '' }) {
  const set = crop ? modules.filter(crop) : modules;
  const use = set.length ? set : modules;
  const b = bounds(use);
  const pad = 16;
  const w = 640;
  const h = 400;
  const spanX = Math.max(1, b.maxX - b.minX);
  const spanZ = Math.max(1, b.maxZ - b.minZ);
  const sx = (w - pad * 2) / spanX;
  const sz = (h - pad * 2) / spanZ;
  const scale = Math.min(sx, sz);
  const rects = [...use].sort((a, c) => a.size[1] - c.size[1]).map((m) => {
    const rw = Math.max(4, m.size[0] * scale);
    const rd = Math.max(4, m.size[2] * scale);
    const x = pad + (m.position[0] - m.size[0] / 2 - b.minX) * scale;
    const y = pad + (b.maxZ - (m.position[2] + m.size[2] / 2)) * scale;
    const stroke = m.id === highlightId ? '#f6c445' : '#111';
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${rw.toFixed(1)}" height="${rd.toFixed(1)}" fill="${fillFor(m, grayscale)}" stroke="${stroke}" stroke-width="${m.id === highlightId ? 3 : 1}"><title>${m.kind} ${m.id}</title></rect>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="${grayscale ? '#e5e5e5' : '#11181f'}"/>
  <text x="16" y="22" fill="#f4f1ea" font-family="system-ui,sans-serif" font-size="14">${escapeXml(title)}</text>
  <text x="16" y="${h - 12}" fill="#c5bba8" font-family="system-ui,sans-serif" font-size="11">Schematic from authored scene coordinates. Not a Pixel capture. Not surveyed architecture.</text>
  ${rects}
</svg>
`;
}

function elevationSvg(modules, title) {
  const solids = modules.filter((m) => m.kind !== 'terrain');
  const use = solids.length ? solids : modules;
  let minX = Infinity; let maxX = -Infinity; let maxH = 0.2;
  for (const m of use) {
    minX = Math.min(minX, m.position[0] - m.size[0] / 2);
    maxX = Math.max(maxX, m.position[0] + m.size[0] / 2);
    maxH = Math.max(maxH, m.position[1] + m.size[1]);
  }
  const w = 640; const h = 400; const pad = 28;
  const scale = Math.min((w - pad * 2) / Math.max(1, maxX - minX), (h - 70) / maxH);
  const ordered = [...use].sort((a, c) => bDepth(c) - bDepth(a));
  const rects = ordered.map((m) => {
    const rw = Math.max(3, m.size[0] * scale);
    const rh = Math.max(3, m.size[1] * scale);
    const x = pad + (m.position[0] - m.size[0] / 2 - minX) * scale;
    const y = h - 36 - (m.position[1] + m.size[1]) * scale;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" fill="${fillFor(m, false)}" stroke="#111"><title>${m.id}</title></rect>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="#87a0b8"/>
  <text x="16" y="22" fill="#111" font-family="system-ui,sans-serif" font-size="14">${escapeXml(title)}</text>
  <text x="16" y="${h - 12}" fill="#1c1917" font-family="system-ui,sans-serif" font-size="11">Street elevation from module heights. Not a photograph.</text>
  ${rects}
</svg>
`;
}

function bDepth(m) {
  return m.position[2];
}

function escapeXml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function truthSvg(slug, doc, scene) {
  const lines = [
    scene.truth || 'Planning twin',
    ...(doc.truth_boundaries || []),
  ].slice(0, 6);
  const body = lines.map((line, i) => `<text x="24" y="${78 + i * 36}" fill="#f4f1ea" font-family="system-ui,sans-serif" font-size="16">${escapeXml(line)}</text>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <rect width="100%" height="100%" fill="#11181f"/>
  <text x="24" y="36" fill="#fecaca" font-family="system-ui,sans-serif" font-size="18">${escapeXml(slug)} truth panel</text>
  ${body}
  <text x="24" y="372" fill="#c5bba8" font-family="system-ui,sans-serif" font-size="12">HUMAN and PIXEL gates remain false. No invented physical campus.</text>
</svg>
`;
}

const scenes = parseScenes(read('apps/mlv-web/src/three/architecture/scenes.ts'));
const files = [];
const gaps = [];

for (const slug of SLUGS) {
  const scene = scenes[slug];
  const doc = JSON.parse(read(`data/campus/v4/${slug}.architecture.json`));
  if (!scene.modules.length) throw new Error(`no modules parsed for ${slug}`);
  const gallery = scene.modules.find((m) => m.kind === 'gallery_hall')
    || scene.modules.find((m) => m.kind === 'media_studio')
    || scene.modules.find((m) => m.kind === 'community_hall');
  if (!scene.modules.some((m) => m.kind === 'gallery_hall')) {
    gaps.push(`${slug}: no gallery_hall volume; gallery sheet uses ${gallery ? gallery.kind : 'site plan'}`);
  }
  const program = scene.zones[0];
  const programMod = program ? scene.modules.find((m) => m.id === program.buildingId) : scene.modules[1];
  const entryish = (m) => ['plaza', 'street', 'raised_walk', 'wayfinding', 'transit', 'truth_label'].includes(m.kind) || m.position[2] > 3;

  const sheets = {
    aerial: planSvg(scene.modules, { title: `${slug} aerial plan` }),
    street: elevationSvg(scene.modules, `${slug} street approach`),
    entry: planSvg(scene.modules, { title: `${slug} entry / approach`, crop: entryish }),
    program: planSvg(scene.modules, { title: `${slug} key program: ${program?.name || 'program'}`, highlightId: programMod?.id || '' }),
    gallery: planSvg(scene.modules, { title: `${slug} gallery / cultural volume`, highlightId: gallery?.id || '' }),
    truth: truthSvg(slug, doc, scene),
    grayscale: planSvg(scene.modules, { title: `${slug} grayscale massing`, grayscale: true }),
  };
  for (const view of VIEWS) {
    const rel = `artifacts/campus/v4/owner_review/${slug}/${view}.svg`;
    write(rel, sheets[view]);
    files.push(rel);
  }
}

const index = {
  schema: 'mlv.owner_review_captures.v1',
  kind: 'schematic_svg_from_scene_coordinates',
  pixel_framebuffer: false,
  surveyed_architecture: false,
  human_gates_false: true,
  PIXEL_7GC_CAMPUS_PASS: false,
  HUMAN_7GC_SPATIAL_FIDELITY_PASS: false,
  HUMAN_LOCAL_IDENTITY_PASS: false,
  HUMAN_CAMPUS_USABILITY_PASS: false,
  campuses: SLUGS,
  views: VIEWS,
  files,
  visual_gaps: gaps,
  note: 'No headless WebGL capture path exists in this repo. Sheets are plans and elevations of the existing V4 scene modules.',
};

write('artifacts/campus/v4/owner_review/INDEX.json', `${JSON.stringify(index, null, 2)}\n`);
console.log(JSON.stringify({ ok: true, files: files.length, gaps }, null, 2));
