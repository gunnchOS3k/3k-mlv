import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  createGhanaOfflineRoomJourney,
  advanceGhanaOfflineRoomJourney,
  runGhanaOfflineRoomPlayable,
  runGhanaOfflinePlayable,
  createGazaRecoveryRoomJourney,
  advanceGazaRecoveryRoomJourney,
  runGazaRecoveryRoomPlayable,
  runGazaPlayable,
  campusBySlug,
  roomsAvailableAtPhase,
} from '../../packages/shared/src/campus/index.js';
import { VISIBILITY, canReadNode } from '../../packages/shared/src/privacyPolicy.js';

const root = join(fileURLToPath(new URL('../..', import.meta.url)));
const scenesSrc = readFileSync(join(root, 'apps/mlv-web/src/three/architecture/scenes.ts'), 'utf8');

describe('Ghana offline room journey', () => {
  it('catalog exposes classroom, hybrid, portfolio, community rooms', () => {
    const campus = campusBySlug('ghana');
    const pilot = roomsAvailableAtPhase(campus, 'PILOT');
    const semi = roomsAvailableAtPhase(campus, 'SEMI_PERMANENT');
    assert.ok(pilot.some((r) => r.key === 'FLEXIBLE_CLASSROOM'));
    assert.ok(pilot.some((r) => r.key === 'HYBRID_LEARNING_RECORDING'));
    assert.ok(semi.some((r) => r.key === 'CAREER_PORTFOLIO_STUDIO'));
    assert.ok(semi.some((r) => r.key === 'COMMUNITY_ROOM'));
  });

  it('scene program zones bind offline specialty rooms', () => {
    assert.match(scenesSrc, /programKey: 'HYBRID_LEARNING_RECORDING'/);
    assert.match(scenesSrc, /programKey: 'CAREER_PORTFOLIO_STUDIO'/);
    assert.match(scenesSrc, /pilot offline lesson cache cart for resume/);
  });

  it('full playable path resumes offline and returns home with private portfolio', () => {
    const result = runGhanaOfflineRoomPlayable({ learnerId: 'gh' });
    assert.equal(result.ok, true, result.reason);
    assert.equal(result.offline_resumed, true);
    assert.equal(result.rooms_include_portfolio_studio, true);
    assert.equal(result.returned_home, true);
    assert.equal(result.private_visibility, true);
    assert.equal(result.regional_exchange.pop_up_route, 'planning_layer_only');
  });

  it('rejects click-through without learner work', () => {
    const { journey } = createGhanaOfflineRoomJourney({ learnerId: 'gh' });
    const denied = advanceGhanaOfflineRoomJourney(journey, 'cache_lesson', { learnerInput: 'x' });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'insufficient_learner_work');
  });

  it('requires planning-route honesty on regional exchange', () => {
    const created = createGhanaOfflineRoomJourney({ learnerId: 'gh' });
    let journey = created.journey;
    for (const [id, input] of [
      ['cache_lesson', 'Mobile-first civic lesson cached for Accra–Tema planning route (offline pack).'],
      ['resume_cached', 'Resumed cached lesson on hybrid recording kit without network.'],
      ['prepare_portfolio', 'Portfolio: regional pop-up kit plan for Tamale planning route (private until publish).'],
    ]) {
      const advanced = advanceGhanaOfflineRoomJourney(journey, id, { learnerInput: input, actorId: 'gh' });
      assert.equal(advanced.ok, true, advanced.reason);
      journey = advanced.journey;
    }
    const denied = advanceGhanaOfflineRoomJourney(journey, 'regional_exchange', {
      learnerInput: 'Live Tamale field deployment exchange with real community drop points.',
      actorId: 'gh',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'regional_exchange_planning_honesty_required');
  });

  it('specialty playable delegates to offline room journey', () => {
    const result = runGhanaOfflinePlayable({ learnerId: 'gh' });
    assert.equal(result.ok, true);
    assert.equal(result.offline_resumed, true);
  });
});

describe('Gaza recovery room journey', () => {
  it('catalog exposes learning circle, offline kit, recon studio', () => {
    const campus = campusBySlug('gaza');
    const recovery = roomsAvailableAtPhase(campus, 'RECOVERY_NETWORK');
    const semi = roomsAvailableAtPhase(campus, 'SEMI_PERMANENT_LEARNING_HUB');
    assert.ok(recovery.some((r) => r.key === 'SAFE_TEMPORARY_LEARNING_CIRCLE'));
    assert.ok(recovery.some((r) => r.key === 'OFFLINE_LEARNING_KIT'));
    assert.ok(semi.some((r) => r.key === 'RECONSTRUCTION_DOCUMENTATION_STUDIO'));
    assert.ok(semi.some((r) => r.key === 'PSYCHOSOCIAL_DECOMPRESSION_SPACE'));
  });

  it('scene program zones bind recovery specialty rooms', () => {
    assert.match(scenesSrc, /programKey: 'OFFLINE_LEARNING_KIT'/);
    assert.match(scenesSrc, /programKey: 'PSYCHOSOCIAL_DECOMPRESSION_SPACE'/);
    assert.match(scenesSrc, /programKey: 'TEACHER_SUPPORT_STATION'/);
    assert.match(scenesSrc, /pilot offline learning kit for shared-device resume/);
  });

  it('full playable path withdraws sharing, blocks coords, returns home', () => {
    const result = runGazaRecoveryRoomPlayable({ learnerId: 'gz' });
    assert.equal(result.ok, true, result.reason);
    assert.equal(result.safety.pass, true);
    assert.equal(result.no_sensitive_locations, true);
    assert.equal(result.rooms_include_learning_circle, true);
    assert.equal(result.rooms_include_offline_kit, true);
    assert.equal(result.returned_home, true);
    assert.equal(result.private_node.visibility, VISIBILITY.PRIVATE);
    assert.equal(canReadNode({ actor: { id: 'bob' }, node: result.private_node }), false);
  });

  it('rejects coordinate leakage in learner input', () => {
    const { journey } = createGazaRecoveryRoomJourney({ learnerId: 'gz' });
    const denied = advanceGazaRecoveryRoomJourney(journey, 'shared_device_orient', {
      learnerInput: 'Shared device note with latitude: 31.5012 and longitude: 34.4667.',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'sensitive_location_forbidden');
  });

  it('specialty playable delegates to recovery room journey', () => {
    const result = runGazaPlayable({ learnerId: 'gz' });
    assert.equal(result.ok, true);
    assert.equal(result.safety.pass, true);
  });
});
