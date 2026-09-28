import { CAMPUS_CATALOG, EXAMPLE_REQUIREMENT_IDS } from '../campus/catalog.js';
import { expandCampusRequirements } from '../campus/model.js';
import { PARENT_PR2, SOURCE_MANIFEST_SHA256 } from './pins.js';
import { validateCampusDesignBundle } from './contracts.js';

const SITE_ID = {
  gary: 'gary',
  ghana: 'ghana',
  guyana: 'guyana',
  geelong: 'geelong',
  germany: 'germany',
  gaza: 'gaza',
  'graham-land': 'graham_land',
};

const TEMPLATE_BY_KEY = {
  HARDWARE_REPAIR_LAB: 'repair_lab',
  MENTOR_WORKSPACE: 'classroom',
  CLIMATE_GIS_STUDIO: 'gis_climate',
  DESIGN_BUILD_STUDIO: 'industry40',
  INDUSTRY40_TWIN_LAB: 'industry40',
  OFFLINE_LEARNING_STUDIO: 'offline_recovery',
  NTN_LAB: 'ntn_remote_sensing',
  FLEXIBLE_CLASSROOM: 'classroom',
  HYBRID_LEARNING_STUDIO: 'hybrid_lecture',
  MEDIA_SOCIAL_CENTER: 'media_collaboration',
};

const IDENTITY = {
  gary: 'Education/community/library/help-desk plus outage scenarios.',
  ghana: 'Low-bandwidth, mobile-lab and power-constrained scenarios.',
  guyana: 'Climate/GIS, energy/logistics and resilience scenarios.',
  geelong: 'Design/prototyping and applied-industry workloads.',
  germany: 'Industry 4.0, sensors/mechatronics and edge-compute scenarios.',
  gaza: 'Offline-first, connectivity/power resilience, abstract network zones only.',
  'graham-land': 'NTN, remote sensing, low-bandwidth/extreme-environment simulation.',
};

function templateFor(req) {
  return TEMPLATE_BY_KEY[req.key] || 'classroom';
}

function zoneFromRequirement(req, campus) {
  const abstract = campus.slug === 'gaza';
  return {
    campus_slug: campus.slug,
    phase: req.phase_token,
    campus_requirement_id: req.id,
    digital_object: req.digital_object,
    digital_route: req.digital_route,
    geometry_fidelity: 'AUTHORED_PLANNING_LAYOUT',
    space_id: req.key.toLowerCase(),
    kind: abstract ? 'ABSTRACT_ZONE' : (req.kind === 'ROOM' ? 'ROOM' : 'ZONE'),
    service_intent_template: templateFor(req),
    material_assumption: abstract ? 'abstract_partition_planning' : 'drywall_and_concrete_planning',
    floor_index: 0,
    redacted: abstract,
  };
}

function candidatesFor(campus, anchorId) {
  const slug = campus.slug === 'graham-land' ? 'graham' : campus.slug;
  const nodes = [
    {
      node_id: `${slug}-indoor-ap-1`,
      role: 'indoor_ap',
      height_m_assumption: 3,
      orientation_assumption: 'ceiling_omni',
      power_dbm_bound: campus.slug === 'ghana' ? 17 : 20,
      radio_count: 2,
      band_profile: 'n78_planning',
      backhaul: campus.slug === 'gaza' ? 'degraded_local' : 'terrestrial',
      edge_compute: false,
      anchor_requirement_id: anchorId,
    },
    {
      node_id: `${slug}-edge-1`,
      role: 'edge_compute',
      height_m_assumption: 1,
      orientation_assumption: 'rack',
      power_dbm_bound: 0,
      radio_count: 1,
      band_profile: 'none',
      backhaul: 'local_edge_wifi',
      edge_compute: true,
      anchor_requirement_id: anchorId,
    },
  ];
  if (campus.slug === 'graham-land') {
    nodes.push({
      node_id: 'graham-ntn-1',
      role: 'ntn_gateway',
      height_m_assumption: 2,
      orientation_assumption: 'optional_fallback',
      power_dbm_bound: 23,
      radio_count: 1,
      band_profile: 'ntn_s_band_planning',
      backhaul: 'ntn_fallback',
      edge_compute: false,
      anchor_requirement_id: anchorId,
    });
  }
  if (campus.slug === 'gaza') {
    nodes.push({
      node_id: 'gaza-offline-1',
      role: 'offline_cache',
      height_m_assumption: 1,
      orientation_assumption: 'local_cache',
      power_dbm_bound: 0,
      radio_count: 1,
      band_profile: 'none',
      backhaul: 'offline_continuation',
      edge_compute: false,
      anchor_requirement_id: anchorId,
    });
  }
  return nodes;
}

export function exportCampusDesignBundle(slug, options = {}) {
  const campus = CAMPUS_CATALOG.find((item) => item.slug === slug);
  if (!campus) return { ok: false, reason: `unknown_campus_${slug}` };
  const requirements = expandCampusRequirements(campus);
  const preferred = EXAMPLE_REQUIREMENT_IDS.find((id) => id.startsWith(`${campus.id}.`));
  const primary = requirements.find((req) => req.id === preferred) || requirements.find((req) => req.specialist) || requirements[0];
  const secondary = requirements.find((req) => req.id !== primary.id && (req.key.includes('CLASSROOM') || req.key.includes('FLEXIBLE') || req.kind === 'ROOM')) || requirements[1] || primary;
  const zones = [zoneFromRequirement(primary, campus), zoneFromRequirement(secondary, campus)];
  const intents = zones.map((zone) => ({
    template: zone.service_intent_template,
    source: 'planning_template',
    assumptions: 'Derived from room/program role. Not measured occupancy. Not learner records.',
    uncertainty: 'high',
    origin: 'configured',
    campus_requirement_id: zone.campus_requirement_id,
  }));
  const doc = {
    schema_name: 'gunnchos.campus_design_bundle',
    schema_version: '1.0.0',
    run_id: options.run_id || `mlv-network-twin-${campus.slug}-design`,
    site_id: SITE_ID[campus.slug],
    campus_slug: campus.slug,
    phase: primary.phase_token,
    geometry_fidelity: 'AUTHORED_PLANNING_LAYOUT',
    source_manifest_sha256: SOURCE_MANIFEST_SHA256,
    source_version_label: 'mlv_campus_v2_current',
    projection_class: 'network_design_planning',
    zones,
    candidate_infrastructure: candidatesFor(campus, primary.id),
    service_intents: intents,
    aggregate_demand: {
      values: { users_proxy: 24, downlink_mbps: 80, origin_note: 'planning template, not measured traffic' },
      origin: 'configured',
    },
    mobility: { values: { class: campus.slug === 'gaza' ? 'abstract_zone' : 'low_named_zone', aggregate_only: true }, origin: 'configured' },
    blockage: { values: { scenario: 'interior_partitions', extra_db: 8 }, origin: 'configured' },
    outage: { values: { terrestrial_outage: campus.slug === 'gary' || campus.slug === 'gaza', degraded: campus.slug === 'ghana' }, origin: 'configured' },
    compute: { values: { local_edge: true, offline_cache: campus.slug === 'gaza' }, origin: 'configured' },
    spectrum: { values: { budget_mhz: campus.slug === 'ghana' ? 10 : 20, band_profile: 'n78_planning' }, origin: 'configured' },
    energy: { values: { budget_j: campus.slug === 'ghana' || campus.slug === 'graham-land' ? 60 : 120 }, origin: 'configured' },
    continuity: { values: { class: campus.slug === 'gaza' ? 'offline_first' : 'degraded_ok', max_interruption_s: 180 }, origin: 'configured' },
    privacy: {
      contains_direct_identifiers: false,
      contains_person_path: false,
      location_precision: campus.slug === 'gaza' ? 'abstract_zone' : 'named_zone',
      gaza_sensitive_export: false,
      graham_station_claim: false,
    },
    uncertainty: {
      overall: 'high',
      notes: 'AUTHORED_PLANNING_LAYOUT; not surveyed geometry. Planning assumptions only.',
    },
    evidence_class: 'SIMULATED',
    producer: {
      repository: '3k-mlv',
      commit: options.producer_commit || PARENT_PR2.head,
    },
    notes: `${IDENTITY[campus.slug]} Representative projection only. 473-room catalog remains in Campus V2.`,
  };
  const check = validateCampusDesignBundle(doc);
  return { ok: check.ok, reason: check.reason, document: doc, campus_identity: IDENTITY[campus.slug] };
}

export function exportAllCampusDesignBundles(options = {}) {
  const results = CAMPUS_CATALOG.map((campus) => exportCampusDesignBundle(campus.slug, options));
  const pass = results.filter((item) => item.ok).length;
  return {
    CAMPUS_DESIGN_EXPORT_SCHEMA_PASS: `${pass}/7`,
    results,
  };
}
