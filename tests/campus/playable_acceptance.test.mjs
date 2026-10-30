import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  playGaryPilotStep,
  createGaryPilotJourney,
  runGaryPlayableAcceptance,
  runNubukePlayableAcceptance,
  runGhanaOfflinePlayable,
  runGazaPlayable,
  runGermanySpecialtyPlayable,
  runGuyanaSpecialtyPlayable,
  runGrahamSpecialtyPlayable,
  runGeelongSpecialtyPlayable,
  offlineSaveConflict,
  PLAYABLE_ACCEPTANCE_NOTE,
  GARY_PILOT_STEPS,
} from '../../packages/shared/src/campus/index.js';
import { VISIBILITY, canReadNode } from '../../packages/shared/src/privacyPolicy.js';

describe('playable acceptance — not navigation prototypes', () => {
  it('Gary full path binds rooms, WAIKE surfaces, private portfolio, Home return', () => {
    const result = runGaryPlayableAcceptance({ learnerId: 'alice' });
    assert.equal(result.ok, true, result.reason);
    assert.equal(result.nav_only, false);
    assert.equal(result.rooms_bound, true);
    assert.equal(result.waike_linked, true);
    assert.equal(result.returned_home, true);
    assert.equal(result.private_visibility, true);
    assert.equal(result.private_node.visibility, VISIBILITY.PRIVATE);
    assert.equal(result.transcript.length, GARY_PILOT_STEPS.length);
    assert.match(PLAYABLE_ACCEPTANCE_NOTE, /not navigation alone/i);
    assert.equal(canReadNode({ actor: { id: 'bob' }, node: result.private_node }), false);
    assert.equal(canReadNode({ actor: { id: 'alice' }, node: result.private_node }), true);
  });

  it('Gary rejects empty learner work (cannot click-through)', () => {
    const { journey } = createGaryPilotJourney({ learnerId: 'alice' });
    const denied = playGaryPilotStep(journey, 'welcome_device_help', { learnerInput: 'short' });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'insufficient_learner_work');
  });

  it('Nubuke heritage produces private artifact, matched views, unknowns retained', () => {
    const result = runNubukePlayableAcceptance({
      learnerId: 'alice',
      observation: 'Garden and gallery relationship teaches climate-responsive gathering without claiming WAIKE occupancy.',
    });
    assert.equal(result.ok, true, result.reason);
    assert.equal(result.nav_only, false);
    assert.equal(result.not_waike_campus, true);
    assert.equal(result.metric_accuracy_status, 'unverified');
    assert.ok(result.matched_views.length >= 3);
    assert.ok(result.evidence_drawer.unknowns_retained.includes('nubuke.area'));
    assert.equal(result.private_node.visibility, VISIBILITY.PRIVATE);
    assert.equal(canReadNode({ actor: { id: 'bob' }, node: result.private_node }), false);
  });

  it('Ghana/Gaza/Germany/Guyana/Graham/Geelong specialty paths are playable', () => {
    assert.equal(runGhanaOfflinePlayable().ok, true);
    assert.equal(runGazaPlayable().ok, true);
    assert.equal(runGermanySpecialtyPlayable().ok, true);
    const gy = runGuyanaSpecialtyPlayable({ learnerId: 'gy' });
    assert.equal(gy.ok, true);
    assert.equal(gy.private_visibility, true);
    assert.equal(gy.scenario.map_export.includes_sensitive_community_data, false);
    const gl = runGrahamSpecialtyPlayable();
    assert.equal(gl.ok, true);
    assert.equal(gl.no_fake_station, true);
    const ge = runGeelongSpecialtyPlayable({ learnerId: 'au' });
    assert.equal(ge.ok, true);
    assert.ok(ge.representation_states.includes('planning_concept'));
    assert.ok(ge.representation_states.includes('documented_historical_reconstruction'));
    assert.ok(ge.representation_states.includes('published_architectural_proposal'));
  });

  it('offline save conflict does not silently overwrite', () => {
    const c = offlineSaveConflict({ localRevision: 'L2', remoteRevision: 'R1' });
    assert.equal(c.ok, true);
    assert.equal(c.conflict, true);
    assert.equal(c.resolution, 'kept_local_explained');
    assert.match(c.notice, /not silently overwritten/i);
  });
});
