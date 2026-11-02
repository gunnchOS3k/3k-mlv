import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAMPUS_SPECS, WORLD_GRAPH } from '../../apps/mlv-web/src/world/worldGraph.mjs';
import { CAMPUS_INTERIOR_ZONE_KINDS } from '../../apps/mlv-web/src/world/campusInteriors.mjs';
import {
  cameraLookAt, chaseCameraPosition, forwardVector, locomotionDelta, resolveChaseCamera, turnYaw,
} from '../../apps/mlv-web/src/world/cameraRig.mjs';
import { minimapAvatar, sceneMinimap } from '../../apps/mlv-web/src/world/minimapLayout.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SPAWN_YAW = Math.PI;
const VERTICAL_FOV = 55;
const MIN_ASPECT = 1.3;

function dot2(a, b) { return a[0] * b[0] + a[1] * b[1]; }

test('chase camera trails the walking direction instead of leading it', () => {
  for (const yaw of [0, Math.PI / 3, Math.PI, -2.1]) {
    const target = [1, 0, 2];
    const cam = chaseCameraPosition(target, yaw);
    const fromTarget = [cam[0] - target[0], cam[2] - target[2]];
    const [dx, dz] = locomotionDelta(yaw, 1, 0, 1);
    assert.ok(dot2(fromTarget, [dx, dz]) < 0, `camera behind heading at yaw ${yaw}`);
    const look = cameraLookAt(target);
    const view = [look[0] - cam[0], look[2] - cam[2]];
    assert.ok(dot2(view, forwardVector(yaw)) > 0, `view faces the heading at yaw ${yaw}`);
  }
});

test('strafe and turn follow screen direction from the chase view', () => {
  for (const yaw of [0, 0.7, Math.PI, 4]) {
    const [fx, fz] = forwardVector(yaw);
    const screenRight = [-fz, fx];
    const [sx, sz] = locomotionDelta(yaw, 0, 1, 1);
    assert.ok(dot2([sx, sz], screenRight) > 0.99, `strafe right is screen-right at yaw ${yaw}`);
    const turned = forwardVector(turnYaw(yaw, 1, 0.1));
    assert.ok(dot2(turned, screenRight) > 0, `look right turns right at yaw ${yaw}`);
  }
});

test('runtime components consume the shared rig', () => {
  const camera = fs.readFileSync(path.join(ROOT, 'apps/mlv-web/src/world/ThirdPersonCamera.tsx'), 'utf8');
  const avatar = fs.readFileSync(path.join(ROOT, 'apps/mlv-web/src/world/AvatarController.tsx'), 'utf8');
  assert.match(camera, /resolveChaseCamera\(target, yaw, pitch, distance, collisions\)/);
  const runtime = fs.readFileSync(path.join(ROOT, 'apps/mlv-web/src/world/WorldRuntime.tsx'), 'utf8');
  assert.match(runtime, /<ThirdPersonCamera[^>]*collisions=\{worldDef\.collisions\}/);
  assert.match(avatar, /locomotionDelta\(yaw, -my, mx, speed \* dt\)/);
  assert.match(avatar, /turnYaw\(facing,/);
});

test('every interior program fixture is in the spawn camera frustum', () => {
  const halfH = Math.atan(Math.tan((VERTICAL_FOV / 2) * Math.PI / 180) * MIN_ASPECT);
  for (const campus of CAMPUS_SPECS) {
    for (const kind of CAMPUS_INTERIOR_ZONE_KINDS) {
      const scene = WORLD_GRAPH[`${campus.slug}-${kind}`];
      const cam = chaseCameraPosition(scene.spawn, SPAWN_YAW);
      const look = cameraLookAt(scene.spawn);
      const viewDir = [look[0] - cam[0], look[2] - cam[2]];
      const norm = Math.hypot(...viewDir);
      const fwd = [viewDir[0] / norm, viewDir[1] / norm];
      const right = [-fwd[1], fwd[0]];
      for (const prop of scene.props.filter((p) => p.id.includes('-program-'))) {
        const rel = [prop.position[0] - cam[0], prop.position[2] - cam[2]];
        const depth = dot2(rel, fwd);
        assert.ok(depth > 0.5, `${prop.id} in front of camera`);
        const angle = Math.atan2(Math.abs(dot2(rel, right)), depth);
        assert.ok(angle < halfH, `${prop.id} within horizontal FOV (${(angle * 180 / Math.PI).toFixed(1)}°)`);
      }
    }
  }
});

function segmentHitsBox(a, b, box) {
  let lo = 0;
  let hi = 1;
  for (let axis = 0; axis < 3; axis += 1) {
    const d = b[axis] - a[axis];
    if (Math.abs(d) < 1e-9) {
      if (a[axis] <= box.min[axis] || a[axis] >= box.max[axis]) return false;
      continue;
    }
    let t1 = (box.min[axis] - a[axis]) / d;
    let t2 = (box.max[axis] - a[axis]) / d;
    if (t1 > t2) [t1, t2] = [t2, t1];
    lo = Math.max(lo, t1);
    hi = Math.min(hi, t2);
    if (lo >= hi) return false;
  }
  return true;
}

function pointInside(p, box) {
  return [0, 1, 2].every((axis) => p[axis] > box.min[axis] && p[axis] < box.max[axis]);
}

/** Avatar stand points the runtime can reach: a grid inside the room, outside every collision footprint. */
function standPoints(scene) {
  const points = [];
  for (let x = -5.6; x <= 5.6; x += 0.8) {
    for (let z = -5.3; z <= 5.3; z += 0.8) {
      const p = [Number(x.toFixed(2)), 0, Number(z.toFixed(2))];
      const blocked = scene.collisions.some((box) => p[0] >= box.min[0] && p[0] <= box.max[0] && p[2] >= box.min[2] && p[2] <= box.max[2]);
      if (!blocked) points.push(p);
    }
  }
  points.push([0, 0, -5.35], [-5.65, 0, 0], [5.65, 0, 2]);
  return points;
}

function occlusions(cameraFor) {
  const failures = [];
  for (const campus of CAMPUS_SPECS) {
    for (const kind of CAMPUS_INTERIOR_ZONE_KINDS) {
      const scene = WORLD_GRAPH[`${campus.slug}-${kind}`];
      for (const stand of standPoints(scene)) {
        const pivot = cameraLookAt(stand);
        if (scene.collisions.some((box) => pointInside(pivot, box))) continue;
        for (let i = 0; i < 16; i += 1) {
          const yaw = (i / 16) * Math.PI * 2;
          const cam = cameraFor(stand, yaw, scene.collisions);
          const box = scene.collisions.find((b) => pointInside(cam, b) || segmentHitsBox(pivot, cam, b));
          if (box) failures.push(`${scene.sceneId} @${stand} yaw ${yaw.toFixed(2)} → ${box.id}`);
        }
      }
    }
  }
  return failures;
}

test('unresolved chase camera clips through interior walls near the back wall', () => {
  const failures = occlusions((stand, yaw) => chaseCameraPosition(stand, yaw));
  assert.ok(failures.length > 100, `old boom clips (${failures.length} cases)`);
  assert.ok(failures.some((f) => f.includes('-back-collision')));
});

test('resolved chase camera never puts a wall or fixture between pivot and lens', () => {
  const failures = occlusions((stand, yaw, collisions) => resolveChaseCamera(stand, yaw, 0.35, 5.2, collisions));
  assert.deepEqual(failures.slice(0, 5), []);
});

test('open sightlines keep the full boom', () => {
  const scene = WORLD_GRAPH['ghana-learning'];
  assert.deepEqual(resolveChaseCamera(scene.spawn, Math.PI, 0.35, 5.2, scene.collisions), chaseCameraPosition(scene.spawn, Math.PI));
  const nearBack = resolveChaseCamera([0, 0, -4.8], 0, 0.35, 5.2, scene.collisions);
  assert.ok(nearBack[2] > -5.4, `camera stays inside the back wall (z=${nearBack[2].toFixed(2)})`);
  assert.ok(nearBack[2] < -4.8, 'camera still trails the avatar');
});

test('minimap plan labels every interior program fixture, route, and action', () => {
  for (const campus of CAMPUS_SPECS) {
    for (const kind of CAMPUS_INTERIOR_ZONE_KINDS) {
      const scene = WORLD_GRAPH[`${campus.slug}-${kind}`];
      const layout = sceneMinimap(scene);
      const labels = scene.props.filter((p) => p.id.includes('-program-')).map((p) => p.label);
      assert.deepEqual(layout.program.map((s) => s.label), labels, `${scene.sceneId} plan program`);
      assert.equal(layout.portals.length, scene.portals.length);
      assert.equal(layout.interactables.length, scene.interactables.length);
      const [vx, vy, vw, vh] = layout.viewBox;
      for (const point of [...layout.program.map((s) => [s.cx, s.cy]), ...layout.portals.map((p) => [p.cx, p.cy])]) {
        assert.ok(point[0] >= vx && point[0] <= vx + vw && point[1] >= vy && point[1] <= vy + vh, `${scene.sceneId} ${point} inside plan`);
      }
    }
  }
});

test('minimap works for every authored scene and points the avatar heading', () => {
  for (const scene of Object.values(WORLD_GRAPH)) {
    const layout = sceneMinimap(scene);
    assert.ok(layout.viewBox.every(Number.isFinite), `${scene.sceneId} finite plan`);
    assert.ok(layout.viewBox[2] > 0 && layout.viewBox[3] > 0);
  }
  const marker = minimapAvatar([0, 0, 5], SPAWN_YAW);
  assert.ok(marker.hy < marker.cy, 'spawn heading points into the room (toward -z, up on the plan)');
});
