import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  REPRESENTATION_STATES,
  assertSourceObservationsImmutableShape,
  createGaryPilotJourney,
  advanceGaryPilotJourney,
  GARY_PILOT_STEPS,
  listLocationRecords,
  loadLocationIndex,
  loadLocationRecord,
  loadSourceObservations,
  reconstructClaimHistory,
  resumeGaryPilotJourney,
  sceneStateLabel,
  validateLocationRecord,
} from '../../packages/shared/src/campus/index.js';

const root = join(fileURLToPath(new URL('../..', import.meta.url)));
const PACKET = '/Users/gunnchos/Downloads/3k_MLV_Fidelity_Plan 2';

describe('location records companion ledger', () => {
  it('indexes all on-disk records without replacing campus RTM', () => {
    const index = loadLocationIndex();
    const files = readdirSync(join(root, 'data/locations/v1/records')).filter((f) => f.endsWith('.json'));
    assert.equal(index.location_ids.length, files.length);
    assert.equal(listLocationRecords().length, files.length);
    // Existing RTM still present
    const rtm = JSON.parse(readFileSync(join(root, 'artifacts/campus/7GC_CAMPUS_REQUIREMENT_TRACEABILITY.json'), 'utf8'));
    assert.ok(rtm.row_count > 400);
  });

  it('validates every record and keeps unknowns null', () => {
    for (const record of listLocationRecords()) {
      const result = validateLocationRecord(record);
      assert.equal(result.ok, true, `${record.location_id}: ${result.errors}`);
      assert.ok(REPRESENTATION_STATES.includes(record.representation_state));
      for (const claim of record.claims) {
        if (claim.evidence_class === 'unknown') {
          for (const dim of claim.dimensions || []) assert.equal(dim.value, null);
        }
      }
    }
  });

  it('keeps source observations immutable-shaped and brief hashes intact', () => {
    const shape = assertSourceObservationsImmutableShape();
    assert.equal(shape.ok, true, shape.errors);
    const obs = loadSourceObservations();
    assert.equal(obs.immutable, true);
    const briefs = {
      'B-GARY': '7d7a21e64360946e1404c2114982bf69e042e599670145f225e66882ffd5eac7',
      'B-GHANA': '1922546896f9e6eca7cacf9a3bd6124732c8a1ca66f67881ddf9eaf8f54a22bb',
      'B-GUYANA': 'f822d251514ddc1a8f59dbee98c3c3ba8e9bda966bb70949ed80ce5f61c29c65',
      'B-GERMANY': 'f9c56755433c929cf26f741344b04d60c08c2603ef86965a711578144d6884ef',
      'B-GEELONG': '8afd6cf0059b3ffcb00d26bf097778381b841aa4e4fe85ff1ced8b9691f39dd2',
      'B-GRAHAM': '3191e791f4c7b15ca03ae3a4fb8eb1fc49525035aa92c7c2e44f6bd73e60cc41',
      'B-GAZA': '96d851d181a0bf00124d3fba0a352c03f18130798509296f7808dfbf3130b3af',
    };
    for (const [id, sha] of Object.entries(briefs)) {
      const row = obs.observations.find((o) => o.source_id === id);
      assert.equal(row.retained_file_sha256, sha);
      const name = row.url_or_local_file.replace('source_briefs/', '');
      const bytes = readFileSync(join(PACKET, 'source_briefs', name));
      assert.equal(createHash('sha256').update(bytes).digest('hex'), sha);
    }
  });

  it('reconstructs Nubuke area decision history and conflict note', () => {
    const hist = reconstructClaimHistory('loc.heritage.nubuke', 'nubuke.area');
    assert.equal(hist.ok, true);
    assert.equal(hist.evidence_class, 'unknown');
    assert.ok(hist.decision_history.length >= 1);
    assert.equal(hist.decision_history.at(-1).resulting_state, 'unknown');
    assert.ok(hist.known_conflicts[0].resolution.includes('Do not average'));
  });

  it('labels campus scenes as planning concepts and Geelong layers distinctly', () => {
    const gary = sceneStateLabel(loadLocationRecord('loc.campus.gary'));
    assert.equal(gary.representation_state, 'planning_concept');
    assert.match(gary.label, /planning concept/i);
    const rone = sceneStateLabel(loadLocationRecord('loc.heritage.geelong_rone_2021'));
    assert.equal(rone.representation_state, 'documented_historical_reconstruction');
    const jwa = sceneStateLabel(loadLocationRecord('loc.heritage.geelong_jwa_proposal'));
    assert.equal(jwa.representation_state, 'published_architectural_proposal');
    const iunw = loadLocationRecord('loc.heritage.iunw_arts_sciences');
    assert.ok(iunw.claims.some((c) => c.claim_id === 'iunw.affiliation'));
  });

  it('keeps Gaza public outputs free of coordinate-like numbers in location records', () => {
    const gaza = JSON.stringify(locationsForCampusSafe());
    assert.equal(/-?\d{1,3}\.\d{3,}/.test(gaza), false);
  });
});

function locationsForCampusSafe() {
  return listLocationRecords().filter((r) => r.campus_id === 'gaza');
}

describe('Gary pilot journey', () => {
  it('completes device help → lab → portfolio → showcase → save → resume/home', () => {
    let { journey } = createGaryPilotJourney({ learnerId: 'a' });
    for (const step of GARY_PILOT_STEPS) {
      const result = advanceGaryPilotJourney(journey, step.id, { payload: { ok: true } });
      assert.equal(result.ok, true, result.reason);
      journey = result.journey;
    }
    assert.equal(journey.returned_home, true);
    assert.equal(journey.saved, true);
    const resumed = resumeGaryPilotJourney(journey);
    assert.equal(resumed.ok, true);
  });

  it('rejects resume-home before save', () => {
    let { journey } = createGaryPilotJourney({ learnerId: 'b' });
    for (const step of GARY_PILOT_STEPS.slice(0, 4)) {
      journey = advanceGaryPilotJourney(journey, step.id).journey;
    }
    const bad = advanceGaryPilotJourney(journey, 'resume_and_home');
    assert.equal(bad.ok, false);
  });
});

describe('packet crosswalk companion', () => {
  it('maps packet CSV without claiming PVS row replacement', () => {
    const doc = JSON.parse(readFileSync(join(root, 'data/fidelity/PACKET_REQUIREMENT_CROSSWALK.json'), 'utf8'));
    assert.equal(doc.pvs_pin, 'GUNNCHOS3K_PVS@1.0.0');
    assert.ok(doc.rows.length >= 70);
    assert.ok(doc.existing_ledgers_preserved.includes('artifacts/campus/7GC_CAMPUS_REQUIREMENT_TRACEABILITY.json'));
    assert.ok(doc.rows.every((r) => r.pvs_compatible === false));
    const data01 = doc.rows.find((r) => r.packet_requirement_id === 'DATA-01');
    assert.equal(data01.mapping_status, 'companion_engineering_in_progress');
  });
});


import {
  createGhanaOfflineJourney,
  ghanaCacheLesson,
  ghanaResumeCachedLesson,
  ghanaPreparePortfolio,
  ghanaRegionalExchange,
  createGazaRecoveryJourney,
  gazaContinueOfflineOnSharedDevice,
  gazaRecoverPortfolio,
  gazaWithdrawSharing,
  gazaPublicExportSafe,
} from '../../packages/shared/src/campus/index.js';

describe('specialty campus journeys', () => {
  it('runs Ghana offline cache → resume → portfolio → regional exchange', () => {
    let { journey } = createGhanaOfflineJourney({ learnerId: 'gh-1' });
    journey = ghanaCacheLesson(journey, { id: 'lesson-1', title: 'Mobile-first intro' }).journey;
    journey = ghanaResumeCachedLesson(journey).journey;
    journey = ghanaPreparePortfolio(journey, { id: 'art-1', title: 'Pop-up kit plan' }).journey;
    const done = ghanaRegionalExchange(journey, { region: 'Tamale planning route' });
    assert.equal(done.ok, true);
    assert.equal(done.journey.regional_exchange.pop_up_route, 'planning_layer_only');
  });

  it('runs Gaza shared-device offline portfolio recovery with safe public export', () => {
    let { journey } = createGazaRecoveryJourney({ learnerId: 'gz-1' });
    journey = gazaContinueOfflineOnSharedDevice(journey).journey;
    journey = gazaRecoverPortfolio(journey, { id: 'p1', title: 'Private draft' }).journey;
    journey = gazaWithdrawSharing(journey).journey;
    const safety = gazaPublicExportSafe(journey);
    assert.equal(safety.pass, true);
    assert.equal(journey.sharing_withdrawn, true);
  });
});

describe('WAIKE pathway crosswalk honesty', () => {
  it('preserves 18 catalog tracks and does not claim instructional completeness', () => {
    const doc = JSON.parse(readFileSync(join(root, 'data/fidelity/WAIKE_PATHWAY_CROSSWALK.json'), 'utf8'));
    assert.equal(doc.counts.catalog_track_ids, 18);
    assert.equal(doc.counts.digital_rc_dirs_on_disk, 16);
    assert.equal(doc.counts.digital_rc_course_keys, 14);
    assert.equal(doc.counts.full_18_course_digital_rc_flag, false);
    assert.equal(doc.gates.INSTRUCTIONAL_COMPLETENESS_CLAIMED, false);
    assert.equal(doc.gates.NO_PATHWAY_DELETED_PASS, true);
    assert.equal(doc.gates.DISK_VS_RC_KEYS_HONESTY_PASS, true);
    assert.equal(doc.gates.FULL_18_COURSE_DIGITAL_RC, false);
    assert.equal(doc.gates.CATALOG_ALIAS_NEQ_INVENTED_TRUE, true);
    assert.equal(doc.gates.HUMAN, false);
    assert.equal(doc.gates.RC2, false);
    assert.equal(doc.gates.V1, false);
    assert.equal(doc.waike_published_tip, '91c03f5');
    assert.equal(doc.waike_floor_tip, '5a18707');
    assert.deepEqual(doc.unmapped_catalog_tracks, ['SEVEN_GC_APPRENTICESHIP']);
    assert.ok(doc.dirs_present_awaiting_course_digital_rc_key.includes('EMBEDDED_PROTOTYPING'));
    assert.ok(Object.keys(doc.eight_track_families).length === 8);
  });
});
