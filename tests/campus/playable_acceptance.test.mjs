import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  playGaryPilotStep,
  createGaryPilotJourney,
  runGaryPlayableAcceptance,
  loadGaryPilotSave,
  runNubukePlayableAcceptance,
  runZollvereinKmsPlayableAcceptance,
  runFolkwangPlayableAcceptance,
  runPalestinianMuseumPlayableAcceptance,
  runPortLockroyPlayableAcceptance,
  runIunwArtsSciencesPlayableAcceptance,
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
import { CAMPUS_CATALOG } from '../../packages/shared/src/campus/catalog.js';
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

  it('Gary resume is a detached save snapshot, and preferred/full rooms stay out of the minimum pilot', () => {
    const created = createGaryPilotJourney({ learnerId: 'alice' });
    let journey = created.journey;
    const inputs = {
      welcome_device_help: 'Phone will not join civic Wi-Fi; need help updating settings.',
      classroom_lab: 'Assembled network drop cable on mobile hardware cart and verified link light.',
      portfolio_artifact: 'Portfolio: documented cable build steps and civic device-help checklist.',
      feedback_showcase: 'Showcase: three slides on device help + lab outcome for community night.',
      repair_lab_peek:
        'Repair lab (schematic planning twin only): traced open bench workflow — not an as-built physical lab claim.',
      gallery_walk: 'Gallery: noted demo kiosk layout for community night without claiming Pixel fidelity.',
      save_progress: 'OK',
    };
    for (const step of GARY_PILOT_STEPS) {
      if (step.id === 'resume_and_home') break;
      const advanced = playGaryPilotStep(journey, step.id, { learnerInput: inputs[step.id], actorId: 'alice' });
      assert.equal(advanced.ok, true, advanced.reason);
      journey = advanced.journey;
    }
    const raw = JSON.stringify(journey);
    journey.artifacts.portfolio_item.payload.portfolio_body = 'mutated-after-save';
    const loaded = loadGaryPilotSave(raw);
    assert.equal(loaded.ok, true);
    assert.equal(loaded.journey.resumed, true);
    assert.equal(loaded.journey.returned_home, false);
    assert.equal(loaded.journey.representation_state, 'planning_concept');
    assert.equal(loaded.journey.artifacts.portfolio_item.payload.portfolio_body.includes('cable build'), true);
    assert.equal('width_m' in loaded.journey, false);
    const home = playGaryPilotStep(loaded.journey, 'resume_and_home', { learnerInput: 'OK', actorId: 'alice' });
    assert.equal(home.ok, true, home.reason);
    assert.equal(home.journey.returned_home, true);
    const gary = CAMPUS_CATALOG.find((c) => c.id === 'GARY');
    const pilot = new Set(gary.rooms.PILOT.map((r) => r.key));
    const preferred = new Set(gary.rooms.SEMI.map((r) => r.key));
    const full = new Set(gary.rooms.FULL.map((r) => r.key));
    for (const step of GARY_PILOT_STEPS.filter((s) => s.program_tier === 'minimum_pilot')) {
      assert.equal(pilot.has(step.room_key), true, step.id);
      assert.equal(preferred.has(step.room_key), false, step.id);
      assert.equal(full.has(step.room_key), false, step.id);
    }
    const repair = GARY_PILOT_STEPS.find((s) => s.id === 'repair_lab_peek');
    const gallery = GARY_PILOT_STEPS.find((s) => s.id === 'gallery_walk');
    assert.equal(repair.program_tier, 'preferred_semi_permanent');
    assert.equal(pilot.has(repair.room_key), false);
    assert.equal(preferred.has(repair.room_key), true);
    assert.equal(gallery.program_tier, 'full_program');
    assert.equal(pilot.has(gallery.room_key), false);
    assert.equal(full.has(gallery.room_key), true);
    assert.equal(gary.rooms.PILOT.length, 8);
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
    assert.equal(result.plan_drawing_source_inspected, false);
    assert.equal(result.metric_dimensions_known, false);
    assert.equal(result.her_03_honesty?.packet_requirement_id, 'HER-03');
    assert.ok(result.matched_views.length >= 3);
    assert.ok(result.evidence_drawer.unknowns_retained.includes('nubuke.area'));
    assert.equal(result.private_node.visibility, VISIBILITY.PRIVATE);
    assert.equal(canReadNode({ actor: { id: 'bob' }, node: result.private_node }), false);
  });

  it('Nubuke HER-02 refuses inspected architect topology, decorative finish match, or metric layout claims', () => {
    const denied = runNubukePlayableAcceptance({
      learnerId: 'alice',
      observation:
        'We inspected the Nubuke architect page and verified the raised gallery garden bungalow spatial relationship; decorative finish matches the foundation source and gallery layout dimensions are measured.',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'nubuke_heritage_honesty_required');
    assert.ok(
      ['topology_source_inspected', 'decorative_finish_source_matched', 'metric_topology_known'].includes(
        denied.forbidden_kind,
      ),
    );
  });

  it('Nubuke HER-03 refuses measured area, construction, partnership, or cultural approval claims', () => {
    const denied = runNubukePlayableAcceptance({
      learnerId: 'alice',
      observation:
        'We verified the 271 m² floor area from traced plans after construction complete and obtained cultural approval from Nubuke partnership.',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'nubuke_heritage_honesty_required');
    assert.ok(['measured_area', 'completed_construction', 'partnership', 'cultural_approval'].includes(denied.forbidden_kind));
  });

  it('Zollverein KMS HER-08 keeps KMS uninspected and unknowns retained', () => {
    const result = runZollvereinKmsPlayableAcceptance({
      learnerId: 'alice',
      observation:
        'Zollverein industrial landscape stays distinct from Folkwang; KMS interactive gap retained without claiming inspected drawings.',
    });
    assert.equal(result.ok, true, result.reason);
    assert.equal(result.kms_drawing_source_inspected, false);
    assert.equal(result.plan_drawing_source_inspected, false);
    assert.equal(result.metric_dimensions_known, false);
    assert.equal(result.her_08_honesty?.packet_requirement_id, 'HER-08');
    assert.ok(result.evidence_drawer.omissions.some((o) => /kms\.ruhrmuseum/i.test(o)));
  });

  it('Zollverein KMS HER-08 refuses inspected KMS drawing, dimensions, construction, partnership, or cultural approval claims', () => {
    const denied = runZollvereinKmsPlayableAcceptance({
      learnerId: 'alice',
      observation:
        'We inspected the KMS drawing and verified 1200 m² footprint after construction complete with Ruhr museum partnership and cultural approval obtained.',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'kms_heritage_honesty_required');
    assert.ok(
      ['kms_drawing_inspected', 'metric_dimensions_known', 'completed_construction', 'partnership', 'cultural_approval'].includes(
        denied.forbidden_kind,
      ),
    );
  });

  it('Folkwang HER-09 refuses inspected drawing, dimensions, construction, partnership, or cultural approval claims', () => {
    const denied = runFolkwangPlayableAcceptance({
      learnerId: 'alice',
      observation:
        'We inspected the Folkwang ground plan and verified 850 m² courtyard area after construction complete with Museum Folkwang partnership and cultural approval obtained.',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'folkwang_heritage_honesty_required');
    assert.ok(
      ['folkwang_drawing_inspected', 'metric_dimensions_known', 'completed_construction', 'partnership', 'cultural_approval'].includes(
        denied.forbidden_kind,
      ),
    );
  });

  it('Palestinian heritage HER-10 refuses inspected drawing, dimensions, construction, partnership, or cultural approval claims', () => {
    const denied = runPalestinianMuseumPlayableAcceptance({
      learnerId: 'alice',
      observation:
        'We inspected the Palestinian Museum archive source and verified 900 m² footprint after construction complete with Palestinian Museum partnership and cultural approval obtained.',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'palestinian_heritage_honesty_required');
    assert.ok(
      ['palestinian_drawing_inspected', 'metric_dimensions_known', 'completed_construction', 'partnership', 'cultural_approval'].includes(
        denied.forbidden_kind,
      ),
    );
  });

  it('Gary reference HER-01 refuses inspected Matterport, dimensions, construction, partnership, WAIKE occupancy, or cultural approval claims', () => {
    const denied = runIunwArtsSciencesPlayableAcceptance({
      learnerId: 'alice',
      observation:
        'We inspected the IUNW Matterport walkthrough and verified 800 m² footprint after construction complete with IUNW partnership and WAIKE operates at IU Northwest.',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'gary_reference_heritage_honesty_required');
    assert.ok(
      ['iu_source_inspected', 'metric_dimensions_known', 'completed_construction', 'partnership', 'waike_occupancy', 'cultural_approval'].includes(
        denied.forbidden_kind,
      ),
    );
  });

  it('Polar heritage HER-11 refuses inspected drawing, dimensions, construction, partnership, or cultural approval claims', () => {
    const denied = runPortLockroyPlayableAcceptance({
      learnerId: 'alice',
      observation:
        'We inspected the Port Lockroy UKAHT virtual visit source and verified 120 m² footprint after construction complete with UKAHT partnership and field authorization obtained.',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'polar_heritage_honesty_required');
    assert.ok(
      ['polar_drawing_inspected', 'metric_dimensions_known', 'completed_construction', 'partnership', 'cultural_approval'].includes(
        denied.forbidden_kind,
      ),
    );
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
