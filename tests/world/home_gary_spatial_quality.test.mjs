import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WORLD_GRAPH } from '../../apps/mlv-web/src/world/worldGraph.mjs';
import { GARY_SCENE } from '../../apps/mlv-web/src/three/architecture/scenes.ts';
import { createHandoffPlan } from '../../apps/mlv-web/src/world/handoffRoutes.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const HOME_SCENES = ['home-yard', 'home-living', 'home-bedroom', 'home-media', 'home-office'];

test('Home rooms have distinct authored furniture and materials, not a shared generic kit', () => {
  const signatures = HOME_SCENES.map((id) => WORLD_GRAPH[id].props.map((prop) => prop.id).join('|'));
  assert.equal(new Set(signatures).size, HOME_SCENES.length);
  for (const id of HOME_SCENES) {
    const scene = WORLD_GRAPH[id];
    assert.ok(scene.props.length >= 7, `${id} needs richer props`);
    assert.ok(scene.props.some((prop) => prop.kind === 'furniture' || prop.kind === 'fixture'), `${id} furniture`);
    assert.equal(scene.truth.coordinates, null);
    assert.equal(scene.truth.affiliationClaim, false);
  }
  assert.ok(WORLD_GRAPH['home-office'].props.some((prop) => prop.id === 'office-desk'));
  assert.ok(WORLD_GRAPH['home-office'].props.some((prop) => prop.id === 'office-monitor'));
  assert.ok(WORLD_GRAPH['home-bedroom'].props.some((prop) => prop.id === 'bed-mattress'));
  assert.ok(WORLD_GRAPH['home-media'].props.some((prop) => prop.id === 'media-screen'));
});

test('Gary exterior, lobby, and classroom are unique authored assemblies with classroom WAIKE panel handoff', () => {
  for (const id of ['gary-arrival', 'gary-lobby', 'gary-learning']) {
    const scene = WORLD_GRAPH[id];
    assert.ok(scene.props.length >= 8, `${id} authored depth`);
    assert.ok(scene.props.every((prop) => String(prop.id).startsWith('gary-')), `${id} prop ids`);
    assert.equal(scene.truth.authoredPlanningTwin, true);
    assert.equal(scene.truth.stylizedNotSurveyed, true);
    assert.equal(scene.truth.coordinates, null);
  }
  const arrivalIds = WORLD_GRAPH['gary-arrival'].props.map((prop) => prop.id).join('|');
  const lobbyIds = WORLD_GRAPH['gary-lobby'].props.map((prop) => prop.id).join('|');
  const learningIds = WORLD_GRAPH['gary-learning'].props.map((prop) => prop.id).join('|');
  assert.notEqual(arrivalIds, lobbyIds);
  assert.notEqual(lobbyIds, learningIds);
  const ghanaArrival = WORLD_GRAPH['ghana-arrival'].props.map((prop) => prop.id).join('|');
  assert.notEqual(arrivalIds, ghanaArrival);

  const waike = WORLD_GRAPH['gary-learning'].interactables.find((item) => item.capability === 'WAIKE_LEARNER');
  assert.ok(waike);
  assert.equal(waike.loadingPolicy, 'PANEL');
  assert.match(waike.label, /classroom workstation/i);

  const plan = createHandoffPlan('waike', 'waike://courses?campus=gary', {
    returnContext: { zone: 'gary-learning', world: 'GARY', anchor: 'GARY_LEARNING' },
  });
  assert.equal(plan.ok, true);
  assert.equal(plan.method, 'internal_contract_surface');
  assert.equal(plan.url, '#/mlv/academic/courses?campus=gary');
  assert.equal(plan.returnTo, '#/mlv/scene/gary-learning');
});

test('Gary architectural scene keeps unique civic-industrial form and pilot program zones without claiming physical facilities', () => {
  assert.match(GARY_SCENE.silhouette, /civic-industrial/i);
  assert.ok(GARY_SCENE.modules.some((mod) => mod.id === 'gary-entry-canopy'));
  assert.ok(GARY_SCENE.modules.some((mod) => mod.id === 'gary-quiet-support'));
  assert.ok(GARY_SCENE.programZones.some((zone) => zone.programKey === 'PRESENTATION_WALL'));
  assert.ok(GARY_SCENE.programZones.some((zone) => zone.programKey === 'QUIET_SUPPORT_AREA'));
  assert.match(GARY_SCENE.truthNote || '', /Not evidence of a deployed physical campus/i);
});

test('Classroom workstation and Home workbench ship in the real app path; human gates stay false', () => {
  const app = fs.readFileSync(path.join(ROOT, 'apps/mlv-web/src/App.tsx'), 'utf8');
  const waike = fs.readFileSync(path.join(ROOT, 'apps/mlv-web/src/campus/WaikeCenter.tsx'), 'utf8');
  const classroom = fs.readFileSync(path.join(ROOT, 'apps/mlv-web/src/campus/ClassroomWorkstation.tsx'), 'utf8');
  assert.match(app, /HomePrivateWorkbench/);
  assert.match(waike, /ClassroomWorkstation/);
  assert.match(classroom, /classroom-workstation/);
  assert.doesNotMatch(classroom, /href=["']https?:\/\/learn\.gunnchos\.com/);
  assert.doesNotMatch(waike, /href=["']https?:\/\/learn\.gunnchos\.com/);
  const gates = JSON.parse(fs.readFileSync(path.join(ROOT, 'artifacts/campus/7GC_CAMPUS_FIDELITY_GATES.json'), 'utf8'));
  assert.equal(gates.gates.HUMAN_7GC_SPATIAL_FIDELITY_PASS, false);
  assert.equal(gates.gates.HUMAN_LOCAL_IDENTITY_PASS, false);
  assert.equal(gates.gates.HUMAN_CAMPUS_USABILITY_PASS, false);
});
