import { EVIDENCE_CLASSES, OBJECTIVE_FIELDS, SOURCE_MANIFEST_SHA256 } from './pins.js';

const SHA256 = /^[0-9a-f]{64}$/;
const GIT_SHA = /^[0-9a-f]{40}$/;
const SERVICE_TEMPLATES = new Set([
  'classroom',
  'hybrid_lecture',
  'repair_lab',
  'gis_climate',
  'industry40',
  'media_collaboration',
  'offline_recovery',
  'ntn_remote_sensing',
]);
const CANDIDATE_ROLES = new Set([
  'indoor_ap',
  'outdoor_small_cell',
  'edge_compute',
  'ntn_gateway',
  'offline_cache',
]);
const ZONE_KEYS = [
  'campus_slug',
  'phase',
  'campus_requirement_id',
  'digital_object',
  'digital_route',
  'geometry_fidelity',
  'space_id',
  'kind',
  'service_intent_template',
];

function fail(reason) {
  return { ok: false, reason };
}

export function validateCampusDesignBundle(doc) {
  if (!doc || typeof doc !== 'object') return fail('not_object');
  if (doc.schema_name !== 'gunnchos.campus_design_bundle') return fail('schema_name');
  if (!/^1\.\d+\.\d+$/.test(doc.schema_version || '')) return fail('schema_version');
  for (const key of [
    'run_id', 'site_id', 'campus_slug', 'phase', 'geometry_fidelity', 'source_manifest_sha256',
    'projection_class', 'zones', 'candidate_infrastructure', 'service_intents', 'aggregate_demand',
    'mobility', 'blockage', 'outage', 'compute', 'spectrum', 'energy', 'continuity', 'privacy',
    'uncertainty', 'evidence_class', 'producer',
  ]) {
    if (doc[key] == null) return fail(`missing_${key}`);
  }
  if (doc.projection_class !== 'network_design_planning') return fail('projection_class');
  if (doc.geometry_fidelity !== 'AUTHORED_PLANNING_LAYOUT') return fail('geometry_must_be_authored_planning_layout');
  if (!SHA256.test(doc.source_manifest_sha256)) return fail('source_manifest_sha256');
  if (doc.source_manifest_sha256 !== SOURCE_MANIFEST_SHA256) return fail('source_manifest_sha_mismatch');
  if (!EVIDENCE_CLASSES.includes(doc.evidence_class)) return fail('evidence_class');
  if (doc.privacy.contains_direct_identifiers !== false) return fail('direct_identifiers');
  if (doc.privacy.contains_person_path !== false) return fail('person_path');
  if (doc.privacy.gaza_sensitive_export !== false) return fail('gaza_sensitive_export');
  if (doc.privacy.graham_station_claim !== false) return fail('graham_station_claim');
  if (!GIT_SHA.test(doc.producer?.commit || '')) return fail('producer_commit');
  if (!Array.isArray(doc.zones) || doc.zones.length < 1) return fail('zones');
  for (const zone of doc.zones) {
    for (const key of ZONE_KEYS) {
      if (!zone[key]) return fail(`zone_missing_${key}`);
    }
    if (zone.geometry_fidelity !== 'AUTHORED_PLANNING_LAYOUT') return fail('zone_geometry');
    if (!SERVICE_TEMPLATES.has(zone.service_intent_template)) return fail('zone_template');
  }
  if (!Array.isArray(doc.candidate_infrastructure) || doc.candidate_infrastructure.length < 1) {
    return fail('candidate_infrastructure');
  }
  for (const node of doc.candidate_infrastructure) {
    if (!CANDIDATE_ROLES.has(node.role)) return fail('candidate_role');
    if (!node.node_id) return fail('candidate_node_id');
  }
  if (!Array.isArray(doc.service_intents) || doc.service_intents.length < 1) return fail('service_intents');
  for (const intent of doc.service_intents) {
    if (!SERVICE_TEMPLATES.has(intent.template)) return fail('intent_template');
    if (intent.origin !== 'configured' && intent.origin !== 'inferred') return fail('intent_origin');
  }
  if (doc.site_id === 'gaza') {
    if (!['abstract_zone', 'site_level', 'none'].includes(doc.privacy.location_precision)) {
      return fail('gaza_location_precision');
    }
  }
  return { ok: true, reason: null };
}

export function validateOptimizationResult(doc) {
  if (!doc || typeof doc !== 'object') return fail('not_object');
  if (doc.schema_name !== 'gunnchos.campus_optimization_result') return fail('schema_name');
  if (doc.geometry_fidelity !== 'AUTHORED_PLANNING_LAYOUT') return fail('geometry');
  if (!SHA256.test(doc.input_design_hash || '')) return fail('input_design_hash');
  if (!SHA256.test(doc.input_twin_state_hash || '')) return fail('input_twin_state_hash');
  if (!SHA256.test(doc.source_manifest_sha256 || '')) return fail('source_manifest_sha256');
  if (!Array.isArray(doc.alternatives) || doc.alternatives.length < 2) return fail('pareto_alternatives');
  for (const field of OBJECTIVE_FIELDS) {
    if (typeof doc.objectives?.[field] !== 'number') return fail(`objective_${field}`);
  }
  if (!doc.selected_alternative_id) return fail('selected_alternative');
  if (!EVIDENCE_CLASSES.includes(doc.evidence_class)) return fail('evidence_class');
  return { ok: true, reason: null };
}

export function measuredDataAvailable(evidenceClass) {
  return [
    'CONTROLLED_DEVICE_MEASUREMENT',
    'SDR_MEASURED',
    'LAB_INSTRUMENT_MEASURED',
    'RAN_TELEMETRY_MEASURED',
    'FIELD_VALIDATED',
  ].includes(evidenceClass);
}

export function predictedMeasuredLabel(evidenceClass) {
  if (!measuredDataAvailable(evidenceClass)) return 'MEASURED DATA: NOT AVAILABLE';
  return `MEASURED CLASS: ${evidenceClass}`;
}

export function syntheticLoopLabel() {
  return 'OFFLINE DEMO / SYNTHETIC';
}

export function geometryDisclaimer() {
  return 'AUTHORED_PLANNING_LAYOUT. Not surveyed, not as-built, not BIM-derived, not field-validated.';
}
