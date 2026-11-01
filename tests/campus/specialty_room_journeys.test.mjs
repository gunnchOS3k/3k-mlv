import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  createGermanyApprenticeshipJourney,
  advanceGermanyApprenticeshipJourney,
  runGermanyApprenticeshipPlayable,
  runGermanySpecialtyPlayable,
  createGuyanaClimateGisJourney,
  advanceGuyanaClimateGisJourney,
  runGuyanaClimateGisPlayable,
  runGuyanaSpecialtyPlayable,
  createGrahamPolarTwinJourney,
  advanceGrahamPolarTwinJourney,
  runGrahamPolarTwinPlayable,
  runGrahamSpecialtyPlayable,
  campusBySlug,
  roomsAvailableAtPhase,
} from '../../packages/shared/src/campus/index.js';
import { VISIBILITY, canReadNode } from '../../packages/shared/src/privacyPolicy.js';

const root = join(fileURLToPath(new URL('../..', import.meta.url)));
const scenesSrc = readFileSync(join(root, 'apps/mlv-web/src/three/architecture/scenes.ts'), 'utf8');

describe('Germany apprenticeship room journey', () => {
  it('catalog exposes mechatronics cart, docs workstation, and I4.0 twin studio', () => {
    const campus = campusBySlug('germany');
    const pilot = roomsAvailableAtPhase(campus, 'PILOT');
    const semi = roomsAvailableAtPhase(campus, 'SEMI_PERMANENT');
    assert.ok(pilot.some((r) => r.key === 'MOBILE_HARDWARE_MECHATRONICS_CART'));
    assert.ok(pilot.some((r) => r.key === 'TECHNICAL_DOCUMENTATION_WORKSTATION'));
    assert.ok(semi.some((r) => r.key === 'INDUSTRY40_DIGITAL_TWIN_STUDIO'));
    assert.ok(semi.some((r) => r.key === 'CAREER_APPRENTICESHIP_STUDIO'));
  });

  it('scene program zones bind apprenticeship rooms', () => {
    assert.match(scenesSrc, /programKey: 'MOBILE_HARDWARE_MECHATRONICS_CART'/);
    assert.match(scenesSrc, /programKey: 'TECHNICAL_DOCUMENTATION_WORKSTATION'/);
    assert.match(scenesSrc, /programKey: 'INDUSTRY40_DIGITAL_TWIN_STUDIO'/);
    assert.match(scenesSrc, /programKey: 'CAREER_APPRENTICESHIP_STUDIO'/);
    assert.match(scenesSrc, /pilot mechatronics cart for build\/document/);
  });

  it('full playable path is room-bound with private portfolio', () => {
    const result = runGermanyApprenticeshipPlayable({ learnerId: 'alice' });
    assert.equal(result.ok, true, result.reason);
    assert.equal(result.nav_only, false);
    assert.equal(result.rooms_include_industry40_studio, true);
    assert.equal(result.rooms_include_mechatronics_cart, true);
    assert.equal(result.returned_home, true);
    assert.equal(result.industrial_cyber_not_cert, true);
    assert.equal(result.schematic_planning_twin_only, true);
    assert.equal(result.PIXEL_7GC_CAMPUS_PASS, false);
    assert.equal(result.HUMAN_7GC_SPATIAL_FIDELITY_PASS, false);
    assert.equal(result.private_node.visibility, VISIBILITY.PRIVATE);
    assert.equal(canReadNode({ actor: { id: 'bob' }, node: result.private_node }), false);
    assert.equal(result.steps_completed.length, 5);
  });

  it('rejects click-through without learner work', () => {
    const { journey } = createGermanyApprenticeshipJourney({ learnerId: 'alice' });
    const denied = advanceGermanyApprenticeshipJourney(journey, 'build', { learnerInput: 'x' });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'insufficient_learner_work');
  });

  it('specialty playable delegates to apprenticeship journey', () => {
    const result = runGermanySpecialtyPlayable({ learnerId: 'alice' });
    assert.equal(result.ok, true);
    assert.equal(result.artifact.steps_completed.length, 5);
    assert.equal(result.rooms_include_industry40_studio, true);
  });

  it('requires industrial-cyber not-cert honesty on twin test step', () => {
    const { journey } = createGermanyApprenticeshipJourney({ learnerId: 'alice' });
    let j = journey;
    for (const [id, input] of [
      ['build', 'Assembled sensor/actuator station on mobile mechatronics cart; verified I/O lights.'],
      ['document', 'SOP: lockout steps, torque table, and quality checklist for apprentice review.'],
    ]) {
      const advanced = advanceGermanyApprenticeshipJourney(j, id, { learnerInput: input, actorId: 'alice' });
      assert.equal(advanced.ok, true, advanced.reason);
      j = advanced.journey;
    }
    const denied = advanceGermanyApprenticeshipJourney(j, 'test', {
      learnerInput: 'Twin bench test passed; awarded industrial cybersecurity certification.',
      actorId: 'alice',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'industrial_cyber_not_cert_honesty_required');
  });
});

describe('Guyana climate/GIS room journey', () => {
  it('catalog exposes climate GIS rooms across pilot/semi', () => {
    const campus = campusBySlug('guyana');
    const pilot = roomsAvailableAtPhase(campus, 'PILOT');
    const semi = roomsAvailableAtPhase(campus, 'SEMI_PERMANENT');
    assert.ok(pilot.some((r) => r.key === 'CLIMATE_GIS_WORKSTATION'));
    assert.ok(semi.some((r) => r.key === 'CLIMATE_GIS_DATA_STUDIO'));
    assert.ok(semi.some((r) => r.key === 'ENERGY_LOGISTICS_STUDIO'));
    assert.ok(semi.some((r) => r.key === 'CAREER_PORTFOLIO_STUDIO'));
  });

  it('scene program zones bind climate GIS specialty rooms', () => {
    assert.match(scenesSrc, /programKey: 'CLIMATE_GIS_WORKSTATION'/);
    assert.match(scenesSrc, /programKey: 'CLIMATE_GIS_DATA_STUDIO'/);
    assert.match(scenesSrc, /programKey: 'ENERGY_LOGISTICS_STUDIO'/);
    assert.match(scenesSrc, /programKey: 'PUBLIC_DASHBOARD_WALL'/);
    assert.match(scenesSrc, /pilot climate\/GIS workstation for flood literacy/);
  });

  it('full playable path keeps synthetic honesty and private portfolio', () => {
    const result = runGuyanaClimateGisPlayable({ learnerId: 'gy' });
    assert.equal(result.ok, true, result.reason);
    assert.equal(result.nav_only, false);
    assert.equal(result.rooms_include_climate_gis, true);
    assert.equal(result.rooms_include_public_dashboard, true);
    assert.equal(result.returned_home, true);
    assert.equal(result.schematic_planning_twin_only, true);
    assert.equal(result.PIXEL_7GC_CAMPUS_PASS, false);
    assert.equal(result.HUMAN_7GC_SPATIAL_FIDELITY_PASS, false);
    assert.equal(result.scenario.map_export.includes_sensitive_community_data, false);
    assert.equal(result.scenario.data_status, 'synthetic');
    assert.equal(result.scenario.dashboard_status, 'schematic_planning_twin_not_live');
    assert.equal(result.private_visibility, true);
  });

  it('requires uncertainty honesty on flood scenario', () => {
    const { journey } = createGuyanaClimateGisJourney({ learnerId: 'gy' });
    const denied = advanceGuyanaClimateGisJourney(journey, 'flood_scenario', {
      learnerInput: 'We fully measured every household impact already.',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'uncertainty_honesty_required');
  });

  it('requires planning-twin honesty on public dashboard step', () => {
    const created = createGuyanaClimateGisJourney({ learnerId: 'gy' });
    let journey = created.journey;
    for (const [id, input] of [
      ['flood_scenario', 'Planning scenario with uncertainty: synthetic overlays; not field-validated.'],
      ['drainage_map', 'Offline map package: river-spine flood literacy layers, no household identifiers.'],
      ['energy_logistics', 'Energy/logistics note: raised spine access during flood drill (planning concept).'],
    ]) {
      const advanced = advanceGuyanaClimateGisJourney(journey, id, { learnerInput: input, actorId: 'gy' });
      assert.equal(advanced.ok, true, advanced.reason);
      journey = advanced.journey;
    }
    const denied = advanceGuyanaClimateGisJourney(journey, 'resilience_dashboard', {
      learnerInput: 'Live city ops board with real-time household flood alerts.',
      actorId: 'gy',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'dashboard_planning_twin_honesty_required');
  });

  it('specialty playable delegates to climate/GIS journey', () => {
    const result = runGuyanaSpecialtyPlayable({ learnerId: 'gy' });
    assert.equal(result.ok, true);
    assert.equal(result.private_visibility, true);
  });
});

describe('Graham Land polar twin room journey', () => {
  it('catalog exposes data lab, satcom cart, GIS studio', () => {
    const campus = campusBySlug('graham-land');
    const remote = roomsAvailableAtPhase(campus, 'REMOTE_LEARNING_LAB');
    const twin = roomsAvailableAtPhase(campus, 'DIGITAL_TWIN_PARTNER_HOSTED_STUDIO');
    assert.ok(remote.some((r) => r.key === 'DATA_LAB'));
    assert.ok(remote.some((r) => r.key === 'NETWORKING_SATCOM_DEMO_CART'));
    assert.ok(remote.some((r) => r.key === 'FLEXIBLE_VIRTUAL_CLASSROOM'));
    assert.ok(twin.some((r) => r.key === 'GIS_REMOTE_SENSING_STUDIO'));
    assert.ok(twin.some((r) => r.key === 'PUBLIC_EDUCATION_STUDIO'));
  });

  it('scene program zones bind polar twin specialty rooms', () => {
    assert.match(scenesSrc, /programKey: 'FLEXIBLE_VIRTUAL_CLASSROOM'/);
    assert.match(scenesSrc, /programKey: 'NETWORKING_SATCOM_DEMO_CART'/);
    assert.match(scenesSrc, /programKey: 'PUBLIC_EDUCATION_STUDIO'/);
    assert.match(scenesSrc, /pilot NTN\/satcom demo cart for low-bw exercise/);
  });

  it('full playable path rejects fake station and returns home', () => {
    const result = runGrahamPolarTwinPlayable({ learnerId: 'gl' });
    assert.equal(result.ok, true, result.reason);
    assert.equal(result.no_fake_station, true);
    assert.equal(result.rooms_include_data_lab, true);
    assert.equal(result.rooms_include_satcom_cart, true);
    assert.equal(result.returned_home, true);
    assert.equal(result.schematic_planning_twin_only, true);
    assert.equal(result.PIXEL_7GC_CAMPUS_PASS, false);
    assert.equal(result.HUMAN_7GC_SPATIAL_FIDELITY_PASS, false);
    assert.equal(result.private_visibility, true);
  });

  it('rejects fake station claims on assumptions step', () => {
    const { journey } = createGrahamPolarTwinJourney({ learnerId: 'gl' });
    const denied = advanceGrahamPolarTwinJourney(journey, 'state_assumptions', {
      learnerInput: 'WAIKE owns an Antarctic research station for this course.',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'no_fake_station_required');
  });

  it('requires simulation≠field honesty on twin ops note', () => {
    const created = createGrahamPolarTwinJourney({ learnerId: 'gl' });
    let journey = created.journey;
    for (const [id, input] of [
      [
        'state_assumptions',
        'Remote-first polar education twin; host outside Antarctica; no fictional WAIKE station; simulation ≠ field validation.',
      ],
      ['low_bw_climate', 'Compressed climate packet for intermittent downlink; assumptions retained.'],
      ['ntn_exercise', 'Satcom demo cart: link budget worksheet for education twin (not field ops).'],
    ]) {
      const advanced = advanceGrahamPolarTwinJourney(journey, id, { learnerInput: input, actorId: 'gl' });
      assert.equal(advanced.ok, true, advanced.reason);
      journey = advanced.journey;
    }
    const denied = advanceGrahamPolarTwinJourney(journey, 'twin_ops_note', {
      learnerInput: 'GIS ops confirmed with live Antarctic sensors and permanent station telemetry.',
      actorId: 'gl',
    });
    assert.equal(denied.ok, false);
    assert.equal(denied.reason, 'twin_ops_simulation_honesty_required');
  });

  it('specialty playable delegates to polar twin journey', () => {
    const result = runGrahamSpecialtyPlayable({ learnerId: 'gl' });
    assert.equal(result.ok, true);
    assert.equal(result.no_fake_station, true);
  });
});
