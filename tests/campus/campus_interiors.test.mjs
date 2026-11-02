import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAMPUS_SPECS, WORLD_GRAPH, assertWorldGraph } from '../../apps/mlv-web/src/world/worldGraph.mjs';
import { CAMPUS_INTERIORS, CAMPUS_INTERIOR_ZONE_KINDS } from '../../apps/mlv-web/src/world/campusInteriors.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ARRAY_FIELDS = [
  'source_requirements', 'design_interpretations', 'building_typologies', 'public_realm',
  'circulation', 'landscape_infrastructure', 'specialist_spaces',
];

function architecture(slug) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, `data/campus/v4/${slug}.architecture.json`), 'utf8'));
}

function sourceStrings(slug) {
  const doc = architecture(slug);
  return new Set(ARRAY_FIELDS.flatMap((field) => doc[field] || []));
}

function inside(point, box) {
  return point[0] >= box.min[0] && point[0] <= box.max[0] && point[2] >= box.min[2] && point[2] <= box.max[2];
}

test('world graph stays valid with campus interiors', () => {
  const result = assertWorldGraph();
  assert.equal(result.ok, true);
});

test('every interior trace is a verbatim architecture-brief string', () => {
  for (const campus of CAMPUS_SPECS) {
    const allowed = sourceStrings(campus.slug);
    const interior = CAMPUS_INTERIORS[campus.slug];
    assert.ok(interior, `interior program for ${campus.slug}`);
    for (const item of interior.shell) assert.ok(allowed.has(item.trace), `${campus.slug} shell ${item.id}: ${item.trace}`);
    for (const kind of CAMPUS_INTERIOR_ZONE_KINDS) {
      for (const item of interior.zones[kind]) assert.ok(allowed.has(item.trace), `${campus.slug}/${kind}: ${item.trace}`);
    }
  }
});

test('all 35 interior zones render traced program fixtures with collisions', () => {
  let zones = 0;
  for (const campus of CAMPUS_SPECS) {
    for (const kind of CAMPUS_INTERIOR_ZONE_KINDS) {
      const scene = WORLD_GRAPH[`${campus.slug}-${kind}`];
      const fixtures = scene.props.filter((prop) => prop.id.includes('-program-'));
      assert.ok(fixtures.length >= 1, `${scene.sceneId} fixtures`);
      for (const [index, prop] of fixtures.entries()) {
        assert.ok(prop.label && prop.trace, `${prop.id} label+trace`);
        assert.ok(scene.collisions.some((box) => box.id === `${scene.sceneId}-program-${index}-collision`), `${prop.id} collision`);
      }
      assert.ok(scene.props.some((prop) => prop.id.includes('-shell-')), `${scene.sceneId} campus shell language`);
      zones += 1;
    }
  }
  assert.equal(zones, 35);
});

test('arrival scenes keep accepted massing path and gain no interior fixtures', () => {
  for (const campus of CAMPUS_SPECS) {
    const scene = WORLD_GRAPH[`${campus.slug}-arrival`];
    assert.equal(scene.props.some((prop) => prop.id.includes('-program-') || prop.id.includes('-shell-')), false);
  }
});

test('same zone kind differs across campuses', () => {
  for (const kind of CAMPUS_INTERIOR_ZONE_KINDS) {
    const fingerprints = CAMPUS_SPECS.map((campus) => WORLD_GRAPH[`${campus.slug}-${kind}`].props
      .filter((prop) => prop.trace).map((prop) => prop.trace).sort().join('|'));
    assert.equal(new Set(fingerprints).size, CAMPUS_SPECS.length, `${kind} interiors are campus-specific`);
  }
});

test('fixtures never block spawn, portals, or interactions', () => {
  for (const campus of CAMPUS_SPECS) {
    for (const kind of CAMPUS_INTERIOR_ZONE_KINDS) {
      const scene = WORLD_GRAPH[`${campus.slug}-${kind}`];
      const boxes = scene.collisions.filter((box) => box.id.includes('-program-'));
      const points = [scene.spawn, ...scene.portals.map((p) => p.position), ...scene.interactables.map((i) => i.position)];
      for (const box of boxes) {
        for (const point of points) assert.equal(inside(point, box), false, `${box.id} blocks ${point}`);
      }
    }
  }
});

test('room program brief is an accessible, honest inline interaction', () => {
  for (const campus of CAMPUS_SPECS) {
    for (const kind of CAMPUS_INTERIOR_ZONE_KINDS) {
      const scene = WORLD_GRAPH[`${campus.slug}-${kind}`];
      const brief = scene.interactables.find((item) => item.capability === 'PROGRAM_BRIEF');
      assert.ok(brief, `${scene.sceneId} brief`);
      assert.equal(brief.loadingPolicy, 'INLINE');
      assert.match(brief.accessibilityAlternative, /not a measured plan/);
      for (const prop of scene.props.filter((p) => p.id.includes('-program-'))) {
        assert.ok(brief.accessibilityAlternative.includes(prop.label), `${scene.sceneId} brief lists ${prop.label}`);
      }
    }
  }
  const handler = fs.readFileSync(path.join(ROOT, 'apps/mlv-web/src/world/InteractionSystem.tsx'), 'utf8');
  assert.match(handler, /case 'PROGRAM_BRIEF':\s*\n\s*handlers\.onStatus\?\.\(item\.accessibilityAlternative\)/);
});

test('truth boundaries survive interior enrichment', () => {
  for (const scene of Object.values(WORLD_GRAPH)) {
    assert.equal(scene.truth.coordinates, null);
    assert.equal(scene.truth.affiliationClaim, false);
  }
  assert.equal(WORLD_GRAPH['gaza-learning'].truth.noPermanentCampusClaim, true);
  assert.equal(WORLD_GRAPH['graham-land-research'].truth.noWaikeOwnedStationClaim, true);
});
