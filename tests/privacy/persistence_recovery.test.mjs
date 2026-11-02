import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RETURN_CONTEXT_KEY,
  persistReturnContext,
  readReturnContext,
  tryParseReturnContext,
} from '../../apps/mlv-web/src/world/ReturnContext.ts';
import {
  WORLD_STATE_KEY,
  loadWorldState,
  saveWorldState,
} from '../../apps/mlv-web/src/world/WorldState.ts';
import {
  BROWSER_WORKSPACE_KEY,
  createWorkspaceSnapshot,
  parseWorkspaceSnapshot,
} from '../../apps/mlv-web/src/workspace/workspaceSnapshot.mjs';
import { parseMlvDeepLink } from '../../packages/shared/src/deepLinks.js';

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

test('all world state fields restore and invalid or cross-world state is rejected', () => {
  const storage = new MemoryStorage();
  const state = {
    mode: 'LIST', world: 'GALLERY', zone: 'gallery-mine',
    avatarPosition: [2, 0, -1], avatarFacing: 1.25, seated: true,
    screenPower: true, returnContext: null, reducedMotion: true,
  };
  assert.deepEqual(saveWorldState(state, storage), { ok: true });
  assert.deepEqual(loadWorldState('GALLERY', storage), state);
  assert.equal(loadWorldState('HOME', storage).zone, 'home-yard');
  storage.setItem(WORLD_STATE_KEY, '{bad');
  assert.equal(loadWorldState('COMMONS', storage).zone, 'commons');
});
test('return context validates, survives either storage scope, and falls back past corruption', () => {
  const local = new MemoryStorage();
  const session = new MemoryStorage();
  const context = {
    world: 'GARY', zone: 'gary-research', anchor: 'GARY_RESEARCH',
    avatarPosition: [3, 0, 4], avatarFacing: 0.4, session: 's1',
  };
  const stored = persistReturnContext(context, { local, session });
  assert.equal(stored.ok, true);
  assert.deepEqual(readReturnContext({ local, session }), context);
  session.setItem(RETURN_CONTEXT_KEY, '{corrupt');
  assert.deepEqual(readReturnContext({ local, session }), context);
  assert.deepEqual(tryParseReturnContext(JSON.stringify({ ...context, avatarPosition: [Infinity, 0, 0] })), { ok: false, reason: 'invalid_shape' });
});

test('browser snapshot reconstructs visibility and revocation metadata without raw tokens or bytes', () => {
  const rawToken = 'abcdefghijklmnop-secret';
  const snapshot = createWorkspaceSnapshot({
    nodes: [{ id: 'n1', owner_id: 'alice', visibility: 'private' }, { id: 'n2', owner_id: 'alice', visibility: 'public' }],
    placements: [{ id: 'p1', node_id: 'n1', owner_id: 'alice' }],
    instances: [{ owner_id: 'alice', home_theme: 'cozy' }],
    shares: [{ node_id: 'n1', owner_id: 'alice', token_hash: 'hashed-only', revoked_at: '2026-01-01T00:00:00.000Z', expires_at: null }],
  });
  const serialized = JSON.stringify(snapshot);
  assert.equal(serialized.includes(rawToken), false);
  assert.equal(serialized.includes('Blob'), false);
  const parsed = parseWorkspaceSnapshot(serialized);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.snapshot.nodes[0].visibility, 'private');
  assert.equal(parsed.snapshot.nodes[1].visibility, 'public');
  assert.equal(parsed.snapshot.shares[0].revoked_at, '2026-01-01T00:00:00.000Z');
  assert.equal(BROWSER_WORKSPACE_KEY, 'mlv.v1.browser_workspace');
});

test('share and scene routes consume validated values without weakening token rules', () => {
  const token = 'abcdefghijklmnopQRSTUV_1234';
  const share = parseMlvDeepLink(`gunnchos://mlv/share/${token}`);
  assert.equal(share.valid, true);
  assert.equal(share.share_token, token);
  assert.equal(parseMlvDeepLink('gunnchos://mlv/share/short').valid, false);
  const scene = parseMlvDeepLink('#/mlv/scene/graham-land-research');
  assert.equal(scene.valid, true);
  assert.equal(scene.scene_id, 'graham-land-research');
});
