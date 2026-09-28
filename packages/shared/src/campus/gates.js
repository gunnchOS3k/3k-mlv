import { CAMPUS_CATALOG, EXAMPLE_REQUIREMENT_IDS } from './catalog.js';
import { assertNonGenericRoomsets, buildCoverage, buildSourceManifest } from './model.js';
import { evidenceMetadataHasNoSecrets, gazaSensitiveLocationSuppressed } from './privacy.js';

export const REQUIRED_FALSE = Object.freeze({
  HUMAN_7GC_SPATIAL_FIDELITY_PASS: false,
  HUMAN_LOCAL_IDENTITY_PASS: false,
  HUMAN_CAMPUS_USABILITY_PASS: false,
  HOSTED_MULTIUSER_PASS: false,
  PIXEL_7GC_CAMPUS_PASS: false,
  MERGE_AUTHORIZED: false,
});

export function evaluateSourceFidelityGates(manifest = buildSourceManifest()) {
  const ids = new Set(manifest.campuses.flatMap((c) => c.requirements.map((r) => r.id)));
  const coverage = buildCoverage(manifest);
  const roomset = assertNonGenericRoomsets();
  const gaza = manifest.campuses.find((c) => c.id === 'GAZA');
  const graham = manifest.campuses.find((c) => c.id === 'GRAHAM');
  const parsed = coverage.BRIEF_DIGITAL_COVERAGE === '100%';
  const missingExamples = EXAMPLE_REQUIREMENT_IDS.filter((id) => !ids.has(id));
  const gazaRedaction = gazaSensitiveLocationSuppressed({
    campus: 'gaza',
    notes: gaza?.planning_identity,
    avoid: gaza?.avoid,
  });
  const grahamRemote = graham?.remote_first === true && graham?.planning_model === 'REMOTE_POLAR_DIGITAL_TWIN';
  const grahamNoFake = graham?.no_fake_station_claim === true
    && (graham?.avoid || []).some((item) => item.includes('fake WAIKE research-station'));
  const evidenceClean = evidenceMetadataHasNoSecrets({
    source: 'urban-planning-brief',
    campuses: manifest.campuses.map((c) => c.id),
  });

  const gates = {
    '7GC_CANONICAL_NODES': `${manifest.node_count}/7`,
    '7GC_SOURCE_REQUIREMENTS_PARSED': parsed ? '100%' : 'INCOMPLETE',
    '7GC_DIGITAL_REQUIREMENT_COVERAGE': parsed ? '100%' : 'INCOMPLETE',
    '7GC_ROOM_PROGRAM_COVERAGE': parsed && missingExamples.length === 0 ? '100%' : 'INCOMPLETE',
    '7GC_PHASE_MODEL_COVERAGE': `${manifest.campuses.filter((c) => c.phases.length === 3).length}/7`,
    '7GC_NON_GENERIC_ROOMSET_PASS': roomset.pass,
    GAZA_RECOVERY_MODEL_PASS: gaza?.planning_model === 'RECOVERY_OFFLINE_FIRST_NETWORK'
      && gaza.phases.some((p) => p.id === 'RECOVERY_NETWORK'),
    GAZA_SENSITIVE_LOCATION_REDACTION_PASS: gaza?.suppress_sensitive_locations === true && gazaRedaction.pass,
    GRAHAM_REMOTE_FIRST_MODEL_PASS: grahamRemote === true,
    GRAHAM_NO_FAKE_STATION_CLAIM_PASS: grahamNoFake === true,
    EVIDENCE_METADATA_NO_SECRETS_PASS: evidenceClean.pass,
    ...REQUIRED_FALSE,
    NEXT_3K_MLV_ACTION: 'OWNER_REVIEW_SEVEN_DIGITAL_CAMPUSES_AND_SOURCE_FIDELITY',
  };

  const requiredTrue = [
    gates['7GC_CANONICAL_NODES'] === '7/7',
    gates['7GC_SOURCE_REQUIREMENTS_PARSED'] === '100%',
    gates['7GC_DIGITAL_REQUIREMENT_COVERAGE'] === '100%',
    gates['7GC_ROOM_PROGRAM_COVERAGE'] === '100%',
    gates['7GC_PHASE_MODEL_COVERAGE'] === '7/7',
    gates['7GC_NON_GENERIC_ROOMSET_PASS'] === true,
    gates.GAZA_RECOVERY_MODEL_PASS === true,
    gates.GAZA_SENSITIVE_LOCATION_REDACTION_PASS === true,
    gates.GRAHAM_REMOTE_FIRST_MODEL_PASS === true,
    gates.GRAHAM_NO_FAKE_STATION_CLAIM_PASS === true,
  ];

  return {
    pass: requiredTrue.every(Boolean) && missingExamples.length === 0,
    missing_example_ids: missingExamples,
    roomset_reason: roomset.pass ? null : roomset.reason,
    counts: Object.fromEntries(manifest.campuses.map((c) => [c.id, c.requirement_count])),
    gates,
  };
}
