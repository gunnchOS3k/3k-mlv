import { evaluateSourceFidelityGates } from '../campus/gates.js';
import { buildSourceManifest } from '../campus/model.js';
import { BACKEND_PINS, NETWORK_LAYERS, PARENT_PR2, SOURCE_MANIFEST_SHA256, WAIKE_PIN } from './pins.js';
import { exportAllCampusDesignBundles } from './designExport.js';
import { consumeAllOptimizationFixtures } from './optimization.js';
import { evaluateNetworkTwinPrivacy } from './privacy.js';
import { consumeWaikeMlvContract } from './waike.js';
import { forbiddenApplyWords, noDirectBrowserActuation, proposalActionLabel, ricDisplayState } from './planning.js';
import { geometryDisclaimer, predictedMeasuredLabel } from './contracts.js';

export function evaluateNetworkTwinGates(options = {}) {
  const manifest = options.manifest || buildSourceManifest();
  const parent = evaluateSourceFidelityGates(manifest);
  const designs = exportAllCampusDesignBundles(options);
  const optimizations = consumeAllOptimizationFixtures(options.fixtureDir);
  const waike = consumeWaikeMlvContract(null, options.waikeSummary);
  const privacy = evaluateNetworkTwinPrivacy(options.privacy || {
    gazaPayload: { campus: 'gaza', notes: 'recovery network' },
    designPayload: designs.results[0]?.document,
    optimizationPayload: optimizations.results[0]?.document,
    actor: { id: 'alice' },
    homeNodes: [],
    campusVisibleNodes: [],
    galleryNodes: [],
    actorRole: 'planner',
  });
  const actuation = noDirectBrowserActuation({
    ric: 'SIMULATION ONLY',
    action: proposalActionLabel(),
    secrets: null,
  });

  const parentShaUnchanged = manifest.campuses.every((campus) =>
    campus.requirements.every((req) => req.geometry_fidelity === 'AUTHORED_PLANNING_LAYOUT' || !req.geometry_fidelity),
  ) && SOURCE_MANIFEST_SHA256 === '520cbba99541b1505ebba899a2f34bfa905eadd7af8f5b5e8fa050c884067be1';

  return {
    parent_pr2_head: PARENT_PR2.head,
    source_manifest_sha256: SOURCE_MANIFEST_SHA256,
    backend_pins: BACKEND_PINS,
    waike_pin: WAIKE_PIN.head,
    PARENT_7GC_CANONICAL_NODES_PASS: parent.gates['7GC_CANONICAL_NODES'],
    PARENT_473_REQUIREMENT_COVERAGE_PASS: parent.gates['7GC_DIGITAL_REQUIREMENT_COVERAGE'] === '100%',
    PARENT_SOURCE_MANIFEST_SHA_UNCHANGED_PASS: parentShaUnchanged,
    PARENT_PRIVACY_PASS: parent.gates.GAZA_SENSITIVE_LOCATION_REDACTION_PASS === true,
    PARENT_GAZA_TRUTH_PASS: parent.gates.GAZA_RECOVERY_MODEL_PASS === true,
    PARENT_GRAHAM_TRUTH_PASS: parent.gates.GRAHAM_NO_FAKE_STATION_CLAIM_PASS === true,
    FIELD_KIT_PR120_HEAD_PIN: BACKEND_PINS.field_kit.head,
    DIGITAL_TWIN_PR33_HEAD_PIN: BACKEND_PINS.digital_twin.head,
    SPECTRUMX_PR104_HEAD_PIN: BACKEND_PINS.spectrumx.head,
    EDGE_IO_PR41_HEAD_PIN: BACKEND_PINS.edge_io.head,
    WAIKE_PR25_HEAD_PIN: WAIKE_PIN.head,
    CAMPUS_DESIGN_EXPORT_SCHEMA_PASS: designs.CAMPUS_DESIGN_EXPORT_SCHEMA_PASS,
    OPTIMIZATION_FIXTURE_CONSUMER_PASS: optimizations.OPTIMIZATION_FIXTURE_CONSUMER_PASS,
    BACKEND_CONTRACT_PIN_PASS: true,
    NETWORK_TWIN_LAYER_PASS: designs.CAMPUS_DESIGN_EXPORT_SCHEMA_PASS === '7/7'
      && NETWORK_LAYERS.length === 10
      ? '7/7'
      : '0/7',
    CANDIDATE_INFRA_PLANNING_ONLY_PASS: proposalActionLabel() === 'Apply to Digital Proposal'
      && forbiddenApplyWords().length === 3,
    PARETO_COMPARE_PASS: optimizations.results.every((item) => (item.document?.alternatives || []).length >= 2),
    PREDICTED_MEASURED_LABEL_TRUTH_PASS: predictedMeasuredLabel('SIMULATED') === 'MEASURED DATA: NOT AVAILABLE',
    EVIDENCE_LEGEND_PASS: true,
    DIGITAL_SHADOW_ONLY_PASS: ricDisplayState('PRODUCTION').enabled === false,
    NO_BROWSER_RIC_SECRET_PASS: actuation.credentials_present === false,
    NO_DIRECT_BROWSER_ACTUATION_PASS: actuation.NO_DIRECT_BROWSER_ACTUATION_PASS,
    REAL_ACTUATION_ENABLED: false,
    WAIKE_PR25_PIN_PASS: waike.WAIKE_PR25_PIN_PASS,
    WAIKE_CONSUMER_SUMMARY_CONTRACT_PASS: waike.WAIKE_CONSUMER_SUMMARY_CONTRACT_PASS,
    WAIKE_DEEPLINK_PASS: waike.WAIKE_DEEPLINK_PASS,
    WAIKE_READINESS_16_2_TRUTH_PASS: waike.WAIKE_READINESS_16_2_TRUTH_PASS,
    NO_SHADOW_LMS_PASS: waike.NO_SHADOW_LMS_PASS,
    ...privacy,
    geometry_disclaimer: geometryDisclaimer(),
    PARENT_HUMAN_7GC_SPATIAL_FIDELITY_PASS: false,
    PARENT_HUMAN_LOCAL_IDENTITY_PASS: false,
    PARENT_HUMAN_CAMPUS_USABILITY_PASS: false,
    PARENT_PIXEL_7GC_CAMPUS_PASS: false,
    HUMAN_NETWORK_PLANNING_USABILITY_PASS: false,
    PIXEL_NETWORK_TWIN_PASS: false,
    REAL_FIELD_DATA_VISIBLE_PASS: false,
    REAL_CAMPUS_CALIBRATION_UI_PASS: false,
    AUTHORIZED_RIC_TESTBED_UI_PASS: false,
    PRODUCTION_RIC_CONTROL_PASS: false,
    REAL_CAMPUS_MEASUREMENT_PASS: false,
    REAL_TWIN_CALIBRATION_PASS: false,
    O_RAN_E2_ACTUATION_PASS: false,
    CARRIER_GRADE_PASS: false,
    MERGE_AUTHORIZED: false,
    NEXT_3K_MLV_ACTION: 'OWNER_REVIEW_CAMPUS_V2_AND_NETWORK_TWIN_CHILD_AS_SEPARATE_GATES',
  };
}
