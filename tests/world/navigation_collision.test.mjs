import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAMPUS_SPECS, WORLD_GRAPH } from '../../apps/mlv-web/src/world/worldGraph.mjs';
import { CAMPUS_INTERIOR_ZONE_KINDS } from '../../apps/mlv-web/src/world/campusInteriors.mjs';
import { locomotionDelta } from '../../apps/mlv-web/src/world/cameraRig.mjs';
import {
  AVATAR_COLLISION_RADIUS,
  resolveMovementXZ,
  resolveXZ,
} from '../../apps/mlv-web/src/world/CollisionWorld.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WALL = { id: 'thin-wall', min: [-0.2, 0, -3], max: [0.2, 3, 3] };

function xzInsideFootprint(p, box) {
  return p[0] >= box.min[0] && p[0] <= box.max[0] && p[2] >= box.min[2] && p[2] <= box.max[2];
}

test('endpoint-only resolveXZ allows tunneling through a thin obstacle', () => {
  const from = [-1.5, 0, 0];
  const tunnel = resolveXZ([from[0] + 3, from[1], from[2]], [WALL]);
  assert.ok(!xzInsideFootprint(tunnel, WALL));
  assert.ok(tunnel[0] > 0.5, 'landed past the wall without touching it');
});

test('swept resolveMovementXZ stops before crossing a thin fixture', () => {
  const from = [-1.5, 0, 0];
  const blocked = resolveMovementXZ(from, 3, 0, [WALL]);
  assert.ok(blocked[0] < -0.2 - AVATAR_COLLISION_RADIUS * 0.5, `stopped before wall (${blocked[0]})`);
  assert.ok(!xzInsideFootprint(blocked, WALL));
});

test('interior back walls block a max-speed frame stride beside the rear wall', () => {
  const stride = 3.2;
  for (const campus of CAMPUS_SPECS) {
    for (const kind of CAMPUS_INTERIOR_ZONE_KINDS) {
      const scene = WORLD_GRAPH[`${campus.slug}-${kind}`];
      const back = scene.collisions.find((b) => b.id.includes('-back-collision'));
      assert.ok(back, `${scene.sceneId} back collision`);
      const from = [0, 0, -4.8];
      if (scene.collisions.some((b) => xzInsideFootprint(from, b))) continue;
      const [dx, dz] = locomotionDelta(0, 1, 0, stride);
      const naive = resolveXZ([from[0] + dx, from[1], from[2] + dz], scene.collisions);
      const swept = resolveMovementXZ(from, dx, dz, scene.collisions);
      assert.ok(xzInsideFootprint(naive, back) || naive[2] > back.max[2] - 0.05,
        `${scene.sceneId} naive stride reaches the back wall column`);
      assert.ok(!xzInsideFootprint(swept, back), `${scene.sceneId} swept stride stays out of back wall`);
    }
  }
});

test('AvatarController uses swept movement shared with the Node suite', () => {
  const avatar = fs.readFileSync(path.join(ROOT, 'apps/mlv-web/src/world/AvatarController.tsx'), 'utf8');
  assert.match(avatar, /resolveMovementXZ\(\[position\[0\], position\[1\], position\[2\]\], dx, dz, collisions\)/);
});
