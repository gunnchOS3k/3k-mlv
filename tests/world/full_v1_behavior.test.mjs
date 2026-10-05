import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CAMPUS_SPECS,
  V1_REQUIRED_SCENE_IDS,
  WORLD_GRAPH,
  assertWorldGraph,
  canonicalCampusSlug,
  reachableSceneIds,
  validateWorldGraph,
} from '../../apps/mlv-web/src/world/worldGraph.mjs';
import { createHandoffPlan, returnSceneHash } from '../../apps/mlv-web/src/world/handoffRoutes.mjs';
import { advanceRotationIndex, rotationAt } from '../../apps/mlv-web/src/campus/galleryRotation.mjs';
import { applyDeadzone, gamepadButtonEdges } from '../../apps/mlv-web/src/world/GamepadControls.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function hasPortal(from, to) {
  return WORLD_GRAPH[from].portals.some((portal) => portal.to === to);
}

function assertRoundTrip(from, to) {
  assert.equal(hasPortal(from, to), true, `${from} -> ${to}`);
  assert.equal(hasPortal(to, from), true, `${to} -> ${from}`);
}

test('authoritative full V1 graph has all 55 reachable scenes and no dead target', () => {
  const report = assertWorldGraph();
  assert.equal(report.sceneCount, 55);
  assert.equal(report.reachableCount, 55);
  assert.deepEqual(new Set(reachableSceneIds()), new Set(V1_REQUIRED_SCENE_IDS));
  assert.deepEqual(validateWorldGraph().errors, []);
});

test('Commons, every Home room, every Gallery wing, and Transit form reciprocal loops', () => {
  assertRoundTrip('commons', 'home-yard');
  assertRoundTrip('home-yard', 'home-living');
  for (const room of ['home-media', 'home-office', 'home-bedroom']) assertRoundTrip('home-living', room);
  assertRoundTrip('commons', 'gallery-lobby');
  for (const wing of ['gallery-local', 'gallery-institution', 'gallery-exchange', 'gallery-public', 'gallery-mine']) {
    assertRoundTrip('gallery-lobby', wing);
  }
  assertRoundTrip('commons', 'transit');
});

test('all seven campuses have arrival, orientation, learning, research, culture, community, and return behavior', () => {
  assert.equal(CAMPUS_SPECS.length, 7);
  for (const campus of CAMPUS_SPECS) {
    const arrival = `${campus.slug}-arrival`;
    const lobby = `${campus.slug}-lobby`;
    assertRoundTrip('transit', arrival);
    assertRoundTrip(arrival, lobby);
    for (const zone of ['learning', 'research', 'gallery', 'community']) {
      const id = `${campus.slug}-${zone}`;
      assertRoundTrip(lobby, id);
      assert.ok(WORLD_GRAPH[id].props.length >= 6, `${id} authored props`);
      assert.ok(WORLD_GRAPH[id].collisions.length >= 2, `${id} collisions`);
      assert.equal(WORLD_GRAPH[id].truth.affiliationClaim, false);
      assert.equal(WORLD_GRAPH[id].truth.coordinates, null);
    }
    assert.ok(WORLD_GRAPH[`${campus.slug}-learning`].interactables.some((item) => item.capability === 'WAIKE_LEARNER'));
    assert.ok(WORLD_GRAPH[`${campus.slug}-research`].interactables.some((item) => item.capability === 'RESEARCH_HANDOFF'));
  }
});

test('Ruhr aliases Germany without creating an eighth campus and special truth constraints hold', () => {
  assert.equal(canonicalCampusSlug('ruhr'), 'germany');
  assert.equal(canonicalCampusSlug('germany'), 'germany');
  assert.equal(WORLD_GRAPH['germany-arrival'].title.startsWith('Ruhr'), true);
  assert.equal(WORLD_GRAPH['gaza-arrival'].truth.suppressSensitiveCoordinates, true);
  assert.equal(WORLD_GRAPH['gaza-arrival'].truth.noPermanentCampusClaim, true);
  assert.equal(WORLD_GRAPH['graham-land-arrival'].truth.noWaikeOwnedStationClaim, true);
  assert.equal(WORLD_GRAPH['graham-land-arrival'].truth.externalReferencesRemainExternal, true);
});

test('real room actions exist for private work, media, logoff, publishing, WAIKE, and research', () => {
  assert.ok(WORLD_GRAPH['home-office'].interactables.some((item) => item.capability === 'PRIVATE_FILE'));
  assert.ok(WORLD_GRAPH['home-media'].interactables.some((item) => item.capability === 'APP_LAUNCH'));
  assert.ok(WORLD_GRAPH['home-bedroom'].interactables.some((item) => item.capability === 'LOGOFF'));
  assert.ok(WORLD_GRAPH['gallery-public'].interactables.some((item) => item.capability === 'PUBLIC_FILE'));
  assert.ok(WORLD_GRAPH['gallery-mine'].interactables.some((item) => item.capability === 'PRIVATE_FILE'));
  for (const scene of Object.values(WORLD_GRAPH)) {
    for (const item of scene.interactables) {
      if (item.targetScene) assert.ok(WORLD_GRAPH[item.targetScene], `${scene.sceneId}:${item.id}`);
    }
    assert.equal('visualGoldSlice' in scene, false);
    assert.equal('structuralComplete' in scene, false);
  }
});

test('WAIKE and research plans preserve the exact scene return contract', () => {
  const returnContext = {
    world: 'GHANA', zone: 'ghana-learning', anchor: 'GHANA_LEARNING',
    avatarPosition: [1, 0, 2], avatarFacing: 0.5, session: 'test',
  };
  const waike = createHandoffPlan('waike', 'waike://courses?campus=ghana', { returnContext });
  assert.equal(waike.ok, true);
  assert.equal(waike.method, 'internal_contract_surface');
  assert.equal(waike.url, '#/mlv/academic/courses?campus=ghana');
  assert.equal(waike.returnTo, '#/mlv/scene/ghana-learning');
  const research = createHandoffPlan('research', 'research://project/7gc-ghana-digital-twin', { returnContext });
  assert.equal(research.ok, true);
  assert.equal(research.url, '#/mlv/research/7gc-ghana-digital-twin');
  assert.equal(returnSceneHash(returnContext), '#/mlv/scene/ghana-learning');
  assert.equal(createHandoffPlan('research', 'https://example.test/not-contract', { returnContext }).ok, false);
});

test('gamepad actions are edge-triggered and analog deadzones remain usable', () => {
  const neutral = { moveX: 0, moveY: 0, lookX: 0, lookY: 0, interact: false, back: false };
  const pressed = { ...neutral, interact: true };
  assert.deepEqual(gamepadButtonEdges(neutral, pressed), { interactPressed: true, backPressed: false });
  assert.deepEqual(gamepadButtonEdges(pressed, pressed), { interactPressed: false, backPressed: false });
  assert.equal(applyDeadzone(0.05), 0);
  assert.ok(applyDeadzone(0.8) > 0.7);
});

test('gallery rotation advances, wraps, reverses, and returns an actual record', () => {
  const exhibits = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  assert.equal(advanceRotationIndex(3, 2, 1), 0);
  assert.equal(advanceRotationIndex(3, 0, -1), 2);
  assert.deepEqual(rotationAt(exhibits, 4), exhibits[1]);
  assert.equal(rotationAt([], 0), null);
});

test('only WorldRuntime is wired into the shipping App path', () => {
  const app = fs.readFileSync(path.join(ROOT, 'apps/mlv-web/src/App.tsx'), 'utf8');
  const runtime = fs.readFileSync(path.join(ROOT, 'apps/mlv-web/src/world/WorldRuntime.tsx'), 'utf8');
  assert.match(app, /WorldRuntime/);
  assert.doesNotMatch(app, /NeighborhoodWorld/);
  assert.doesNotMatch(app, /from ['"]\.\/three\/World['"]/);
  assert.doesNotMatch(runtime, /NeighborhoodWorld|sceneGraph\.mjs|buildScene/);
});

test('full V1 evidence keeps every external, device, human, and merge gate false', () => {
  const evidence = JSON.parse(fs.readFileSync(path.join(ROOT, 'artifacts/v1_scope/FULL_V1_AUTOMATED_EVIDENCE.json'), 'utf8'));
  assert.equal(evidence.world_graph.declared_scene_count, 55);
  assert.equal(evidence.world_graph.reachable_scene_count, 55);
  assert.equal(evidence.real_app_browser_acceptance.declared_routes_traversed, 55);
  assert.deepEqual(evidence.real_app_browser_acceptance.route_failures, []);
  assert.equal(evidence.gates.V1_MLV_AUTOMATED_SCOPE_PASS, true);
  for (const [gate, value] of Object.entries(evidence.gates)) {
    if (gate !== 'V1_MLV_AUTOMATED_SCOPE_PASS') assert.equal(value, false, gate);
  }
  assert.equal(evidence.prohibited_actions_not_taken.force_push, true);
  assert.equal(evidence.prohibited_actions_not_taken.merge_pr_9, true);
});
