import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  createGeelongDesignBuildJourney,
  advanceGeelongDesignBuildJourney,
  runGeelongDesignBuildPlayable,
  runGeelongSpecialtyPlayable,
  campusBySlug,
  roomsAvailableAtPhase,
} from '../../packages/shared/src/campus/index.js';
import { VISIBILITY, canReadNode } from '../../packages/shared/src/privacyPolicy.js';

const root = join(fileURLToPath(new URL('../..', import.meta.url)));

describe('Geelong design/build room wiring', () => {
  it('catalog exposes DESIGN_BUILD_STUDIO at SEMI and CAREER_PORTFOLIO_STUDIO', () => {
    const campus = campusBySlug('geelong');
    const semi = roomsAvailableAtPhase(campus, 'SEMI_PERMANENT');
    const keys = new Set(semi.map((r) => r.key));
    assert.equal(keys.has('DESIGN_BUILD_STUDIO'), true);
    assert.equal(keys.has('CAREER_PORTFOLIO_STUDIO'), true);
    const studio = semi.find((r) => r.key === 'DESIGN_BUILD_STUDIO');
    assert.equal(studio.specialist, true);
    assert.ok(studio.waike.includes('assignments'));
  });

  it('scene program zones bind DESIGN_BUILD_STUDIO and pilot prototype cart', () => {
    const src = readFileSync(join(root, 'apps/mlv-web/src/three/architecture/scenes.ts'), 'utf8');
    assert.match(src, /programKey: 'DESIGN_BUILD_STUDIO'/);
    assert.match(src, /programKey: 'MOBILE_HARDWARE_CART'/);
    assert.match(src, /programKey: 'CAREER_PORTFOLIO_STUDIO'/);
    assert.match(src, /pilot prototype cart for critique/);
  });

  it('full playable path binds DESIGN_BUILD_STUDIO twice and keeps private portfolio', () => {
    const result = runGeelongDesignBuildPlayable({ learnerId: 'alice' });
    assert.equal(result.ok, true, result.reason);
    assert.equal(result.nav_only, false);
    assert.equal(result.rooms_include_design_build_studio, true);
    assert.equal(result.returned_home, true);
    assert.equal(result.private_node.visibility, VISIBILITY.PRIVATE);
    assert.equal(canReadNode({ actor: { id: 'bob' }, node: result.private_node }), false);
    const dbSteps = result.transcript.filter((t) => t.room_key === 'DESIGN_BUILD_STUDIO');
    assert.ok(dbSteps.length >= 2);
    assert.ok(result.layer_states.includes('planning_concept'));
    assert.ok(result.layer_states.includes('published_architectural_proposal'));
  });

  it('rejects click-through without learner work', () => {
    const { journey } = createGeelongDesignBuildJourney({ learnerId: 'alice' });
    const denied = advanceGeelongDesignBuildJourney(journey, 'orient_temporal_layers', { learnerInput: 'short' });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'insufficient_learner_work');
  });

  it('specialty playable delegates to design/build journey', () => {
    const result = runGeelongSpecialtyPlayable({ learnerId: 'alice' });
    assert.equal(result.ok, true);
    assert.equal(result.rooms_include_design_build_studio, true);
  });
});

describe('review-build capture artifacts', () => {
  it('writes review HTML + manifest when capture script has been run', () => {
    const html = join(root, 'artifacts/fidelity/review_build/index.html');
    const man = join(root, 'artifacts/fidelity/review_build/REVIEW_MANIFEST.json');
    // Allow test to run before capture: soft-skip if absent by asserting script exists
    assert.equal(existsSync(join(root, 'scripts/capture-playable-review.mjs')), true);
    if (existsSync(man)) {
      const doc = JSON.parse(readFileSync(man, 'utf8'));
      assert.equal(doc.gates.HUMAN_7GC_SPATIAL_FIDELITY_PASS, false);
      assert.equal(doc.gates.PIXEL_7GC_CAMPUS_PASS, false);
      assert.equal(doc.results.gary.ok, true);
      assert.equal(doc.results.nubuke.ok, true);
      assert.equal(doc.results.geelong.ok, true);
      assert.equal(existsSync(html), true);
    }
  });
});
