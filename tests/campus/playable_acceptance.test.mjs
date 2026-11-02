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
    assert.equal(result.repair_lab_planning_twin_only, true);
    assert.equal(result.as_built_facility_claim, false);
    assert.equal(result.PIXEL_7GC_CAMPUS_PASS, false);
    assert.equal(result.HUMAN_7GC_SPATIAL_FIDELITY_PASS, false);
    assert.equal(result.HUMAN, false);
    assert.equal(result.RC2, false);
    assert.equal(result.V1, false);
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

  it('Gary requires repair-lab planning-twin honesty (not as-built facility)', () => {
    const created = createGaryPilotJourney({ learnerId: 'alice' });
    let journey = created.journey;
    for (const [id, input] of [
      ['welcome_device_help', 'Phone will not join civic Wi-Fi; need help updating settings.'],
      ['classroom_lab', 'Assembled network drop cable on mobile hardware cart and verified link light.'],
      ['portfolio_artifact', 'Portfolio: documented cable build steps and civic device-help checklist.'],
      ['feedback_showcase', 'Showcase: three slides on device help + lab outcome for community night.'],
    ]) {
      const advanced = playGaryPilotStep(journey, id, { learnerInput: input, actorId: 'alice' });
      assert.equal(advanced.ok, true, advanced.reason);
      journey = advanced.journey;
    }
    const denied = playGaryPilotStep(journey, 'repair_lab_peek', {
      learnerInput: 'Visited the finished physical repair facility and certified the as-built tool wall.',
      actorId: 'alice',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'repair_lab_planning_twin_honesty_required');
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
