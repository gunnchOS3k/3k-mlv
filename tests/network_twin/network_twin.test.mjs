import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { CAMPUS_LANDING, EXAMPLE_REQUIREMENT_IDS } from '../../packages/shared/src/campus/catalog.js';
import { buildSourceManifest } from '../../packages/shared/src/campus/model.js';
import { evaluateSourceFidelityGates } from '../../packages/shared/src/campus/gates.js';
import { parseMlvDeepLink } from '../../packages/shared/src/deepLinks.js';
import {
  BACKEND_PINS,
  CANDIDATE_KINDS,
  EVIDENCE_CLASSES,
  NETWORK_LAYERS,
  SOURCE_MANIFEST_SHA256,
  WAIKE_PIN,
  consumeAllOptimizationFixtures,
  evaluateNetworkTwinGates,
  exportAllCampusDesignBundles,
  forbiddenApplyWords,
  networkOptimizationHasNoLearnerRecords,
  noDirectBrowserActuation,
  predictedMeasuredLabel,
  proposalActionLabel,
  ricDisplayState,
  unboundWaikeCampus,
} from '../../packages/shared/src/networkTwin/index.js';

const root = join(fileURLToPath(new URL('../..', import.meta.url)));

describe('Network Twin parent regressions', () => {
  const manifest = buildSourceManifest();
  const fidelity = evaluateSourceFidelityGates(manifest);

  it('keeps seven canonical nodes and 473 coverage', () => {
    assert.equal(fidelity.gates['7GC_CANONICAL_NODES'], '7/7');
    assert.equal(fidelity.gates['7GC_DIGITAL_REQUIREMENT_COVERAGE'], '100%');
    assert.equal(fidelity.pass, true);
  });

  it('does not change the Campus V2 source-version identifier', () => {
    const committed = JSON.parse(readFileSync(join(root, 'data/campus/7gc-campus-source-manifest.json'), 'utf8'));
    assert.equal(committed.requirement_count, manifest.requirement_count);
    assert.equal(SOURCE_MANIFEST_SHA256, '520cbba99541b1505ebba899a2f34bfa905eadd7af8f5b5e8fa050c884067be1');
  });

  it('preserves Gaza and Graham truth', () => {
    assert.equal(fidelity.gates.GAZA_RECOVERY_MODEL_PASS, true);
    assert.equal(fidelity.gates.GAZA_SENSITIVE_LOCATION_REDACTION_PASS, true);
    assert.equal(fidelity.gates.GRAHAM_REMOTE_FIRST_MODEL_PASS, true);
    assert.equal(fidelity.gates.GRAHAM_NO_FAKE_STATION_CLAIM_PASS, true);
  });
});

describe('Network Twin contracts', () => {
  it('exports schema-valid design bundles for 7/7 campuses', () => {
    const exported = exportAllCampusDesignBundles();
    assert.equal(exported.CAMPUS_DESIGN_EXPORT_SCHEMA_PASS, '7/7');
    for (const item of exported.results) {
      assert.equal(item.ok, true, item.reason);
      assert.equal(item.document.geometry_fidelity, 'AUTHORED_PLANNING_LAYOUT');
      for (const zone of item.document.zones) {
        assert.ok(zone.campus_requirement_id);
        assert.ok(zone.digital_object);
        assert.ok(zone.digital_route);
        assert.equal(zone.geometry_fidelity, 'AUTHORED_PLANNING_LAYOUT');
      }
    }
    const ids = exported.results.flatMap((item) => item.document.zones.map((z) => z.campus_requirement_id));
    for (const example of EXAMPLE_REQUIREMENT_IDS) {
      assert.equal(ids.includes(example), true, `missing zone ${example}`);
    }
  });

  it('consumes pinned Phase-1 optimization fixtures for 7/7', () => {
    const consumed = consumeAllOptimizationFixtures();
    assert.equal(consumed.OPTIMIZATION_FIXTURE_CONSUMER_PASS, '7/7');
    for (const item of consumed.results) {
      assert.equal(item.label, 'OFFLINE DEMO / SYNTHETIC');
      assert.ok(item.document.alternatives.length >= 2);
    }
  });

  it('pins live backend and WAIKE heads', () => {
    const gates = evaluateNetworkTwinGates();
    assert.equal(gates.FIELD_KIT_PR120_HEAD_PIN, BACKEND_PINS.field_kit.head);
    assert.equal(gates.DIGITAL_TWIN_PR33_HEAD_PIN, BACKEND_PINS.digital_twin.head);
    assert.equal(gates.SPECTRUMX_PR104_HEAD_PIN, BACKEND_PINS.spectrumx.head);
    assert.equal(gates.EDGE_IO_PR41_HEAD_PIN, BACKEND_PINS.edge_io.head);
    assert.equal(gates.WAIKE_PR25_HEAD_PIN, WAIKE_PIN.head);
    assert.equal(gates.BACKEND_CONTRACT_PIN_PASS, true);
  });
});

describe('Network Twin UX and privacy', () => {
  it('keeps Network Twin inside Campus navigation', () => {
    assert.equal(CAMPUS_LANDING.some((item) => item.id === 'network-twin'), true);
    assert.equal(NETWORK_LAYERS[0], 'Campus');
    const route = parseMlvDeepLink('#/mlv/campus/gary/network-twin');
    assert.equal(route.valid, true);
    assert.equal(route.kind, 'campus');
    assert.equal(route.campus_slug, 'gary');
    assert.equal(route.campus_rest.includes('network-twin'), true);
  });

  it('is planning-only and has no browser actuation', () => {
    assert.equal(proposalActionLabel(), 'Apply to Digital Proposal');
    assert.deepEqual(forbiddenApplyWords(), ['Apply to Network', 'Push to RIC', 'Deploy Radio']);
    assert.equal(ricDisplayState('PRODUCTION').enabled, false);
    assert.equal(ricDisplayState('AUTHORIZED TESTBED').enabled, false);
    const actuation = noDirectBrowserActuation({ action: proposalActionLabel() });
    assert.equal(actuation.NO_DIRECT_BROWSER_ACTUATION_PASS, true);
    assert.equal(actuation.REAL_ACTUATION_ENABLED, false);
    assert.equal(CANDIDATE_KINDS.every((item) => item.planning_only), true);
  });

  it('labels synthetic evidence honestly', () => {
    assert.equal(predictedMeasuredLabel('SIMULATED'), 'MEASURED DATA: NOT AVAILABLE');
    assert.equal(EVIDENCE_CLASSES.includes('FIELD_VALIDATED'), true);
  });

  it('does not join learner records into optimization', () => {
    const clean = networkOptimizationHasNoLearnerRecords({ notes: 'planning only' });
    assert.equal(clean.NO_WAIKE_LEARNER_RECORDS_IN_NETWORK_OPTIMIZATION_PASS, true);
    const dirty = networkOptimizationHasNoLearnerRecords({ grades: [99] });
    assert.equal(dirty.NO_WAIKE_LEARNER_RECORDS_IN_NETWORK_OPTIMIZATION_PASS, false);
  });

  it('preserves WAIKE contract truth', () => {
    const waike = unboundWaikeCampus();
    assert.equal(waike.WAIKE_PR25_PIN_PASS, true);
    assert.equal(waike.WAIKE_DEEPLINK_PASS, true);
    assert.equal(waike.WAIKE_READINESS_16_2_TRUTH_PASS, true);
    assert.equal(waike.readiness.claim_18_of_18_fully_ready, false);
    assert.equal(waike.NO_SHADOW_LMS_PASS, true);
    assert.equal(waike.consumer_summary.mode, 'FIXTURE / DEMO');
  });

  it('keeps human / pixel / merge / physical gates false', () => {
    const gates = evaluateNetworkTwinGates();
    assert.equal(gates.PARENT_HUMAN_7GC_SPATIAL_FIDELITY_PASS, false);
    assert.equal(gates.PIXEL_NETWORK_TWIN_PASS, false);
    assert.equal(gates.REAL_CAMPUS_MEASUREMENT_PASS, false);
    assert.equal(gates.O_RAN_E2_ACTUATION_PASS, false);
    assert.equal(gates.MERGE_AUTHORIZED, false);
    assert.equal(gates.NEXT_3K_MLV_ACTION, 'OWNER_REVIEW_CAMPUS_V2_AND_NETWORK_TWIN_CHILD_AS_SEPARATE_GATES');
    assert.equal(gates.NETWORK_TWIN_LAYER_PASS, '7/7');
    assert.equal(gates.CAMPUS_DESIGN_EXPORT_SCHEMA_PASS, '7/7');
    assert.equal(gates.OPTIMIZATION_FIXTURE_CONSUMER_PASS, '7/7');
  });
});
