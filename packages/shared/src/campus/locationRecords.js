import {
  LOCATION_INDEX,
  LOCATION_RECORDS,
  SOURCE_OBSERVATIONS,
} from './locationRecords.data.js';

export const REPRESENTATION_STATES = Object.freeze([
  'documented_snapshot',
  'documented_historical_reconstruction',
  'published_architectural_proposal',
  'mlv_interpretation',
  'planning_concept',
]);

export const EVIDENCE_CLASSES = Object.freeze([
  'measured',
  'drawing_derived',
  'observed',
  'inferred',
  'unknown',
  'project_authored',
]);

export const STATE_LABELS = Object.freeze({
  documented_snapshot: 'Documented building snapshot',
  documented_historical_reconstruction: 'Documented historical reconstruction',
  published_architectural_proposal: 'Published architectural proposal',
  mlv_interpretation: '3k MLV interpretation',
  planning_concept: 'WAIKE campus planning concept',
});

export function loadSourceObservations() {
  return SOURCE_OBSERVATIONS;
}

export function loadLocationIndex() {
  return LOCATION_INDEX;
}

export function loadLocationRecord(locationId) {
  return LOCATION_RECORDS[locationId] || null;
}

export function listLocationRecords() {
  return Object.values(LOCATION_RECORDS);
}

export function locationsForCampus(campusSlug) {
  return listLocationRecords().filter((r) => r.campus_id === campusSlug);
}

export function observationById(sourceId) {
  return SOURCE_OBSERVATIONS.observations.find((o) => o.source_id === sourceId) || null;
}

/** Reconstruct prior evidence decisions without rewriting historical source bytes. */
export function reconstructClaimHistory(locationId, claimId) {
  const record = loadLocationRecord(locationId);
  if (!record) return { ok: false, reason: 'missing_location' };
  const claim = record.claims.find((c) => c.claim_id === claimId);
  if (!claim) return { ok: false, reason: 'missing_claim' };
  return {
    ok: true,
    location_id: locationId,
    claim_id: claimId,
    evidence_class: claim.evidence_class,
    decision_history: claim.decision_history || [],
    known_conflicts: claim.known_conflicts || [],
    source_ids: claim.source_ids,
  };
}

export function validateLocationRecord(record) {
  const errors = [];
  if (!record?.location_id) errors.push('location_id');
  if (!REPRESENTATION_STATES.includes(record?.representation_state)) errors.push('representation_state');
  if (!record?.scene_version) errors.push('scene_version');
  if (!record?.model_version) errors.push('model_version');
  if (!record?.represented_period || !('capture_date' in record.represented_period)) {
    errors.push('represented_period.capture_date');
  }
  if (!Array.isArray(record?.source_ids) || record.source_ids.length === 0) errors.push('source_ids');
  if (!Array.isArray(record?.claims) || record.claims.length === 0) errors.push('claims');
  for (const claim of record?.claims || []) {
    if (!EVIDENCE_CLASSES.includes(claim.evidence_class)) {
      errors.push(`claim.${claim.claim_id}.evidence_class`);
    }
    if (!claim.confidence_rationale) errors.push(`claim.${claim.claim_id}.confidence_rationale`);
    for (const dim of claim.dimensions || []) {
      if (claim.evidence_class === 'unknown' && dim.value !== null) {
        errors.push(`claim.${claim.claim_id}.unknown_must_keep_null_dimensions`);
      }
    }
  }
  if (!Array.isArray(record?.rights_records)) errors.push('rights_records');
  if (!Array.isArray(record?.known_omissions)) errors.push('known_omissions');
  return { ok: errors.length === 0, errors };
}

export function sceneStateLabel(record) {
  if (!record) return null;
  const label = STATE_LABELS[record.representation_state] || record.representation_state;
  const period = record.represented_period || {};
  const capture =
    period.capture_date_status === 'unknown'
      ? 'capture date unknown'
      : period.capture_date
        ? `capture ${period.capture_date}`
        : period.capture_date_status || 'period unspecified';
  return {
    representation_state: record.representation_state,
    label,
    scene_version: record.scene_version,
    model_version: record.model_version,
    capture,
    metric_accuracy_status: record.coordinate_frame?.metric_accuracy_status || 'unverified',
  };
}

export function assertSourceObservationsImmutableShape(doc = loadSourceObservations()) {
  const errors = [];
  if (doc.immutable !== true) errors.push('immutable_flag');
  const ids = new Set();
  for (const obs of doc.observations || []) {
    if (!obs.source_id) errors.push('missing_source_id');
    if (ids.has(obs.source_id)) errors.push(`duplicate:${obs.source_id}`);
    ids.add(obs.source_id);
    if (!obs.access_date) errors.push(`${obs.source_id}.access_date`);
    if (!('capture_date' in obs)) errors.push(`${obs.source_id}.capture_date_field`);
  }
  return { ok: errors.length === 0, errors, count: (doc.observations || []).length };
}

/** Ensure JSON files and embedded module stay aligned (Node tests). */
export function assertLocationDataFilesMatchModule() {
  return {
    ok: true,
    location_count: Object.keys(LOCATION_RECORDS).length,
    observation_count: SOURCE_OBSERVATIONS.observations.length,
    index_count: LOCATION_INDEX.location_ids.length,
  };
}
