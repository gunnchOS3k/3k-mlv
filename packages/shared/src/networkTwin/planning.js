import { ALLOWED_PROPOSAL_ACTION, FORBIDDEN_APPLY_WORDS, OBJECTIVE_FIELDS, RIC_ALLOWED_STATES, RIC_DISABLED_STATES } from './pins.js';

export const SERVICE_INTENT_TEMPLATES = Object.freeze([
  {
    id: 'classroom_learning',
    label: 'classroom learning',
    schema_template: 'classroom',
    latency_ms: 40,
    jitter_ms: 8,
    packet_loss_pct: 1,
    throughput_mbps: 25,
    reliability: 0.95,
    continuity_class: 'degraded_ok',
    compute: 'shared_classroom',
    privacy_class: 'aggregate_only',
    priority_class: 'standard',
    provenance: 'configured_planning_assumption',
    uncertainty: 'high',
  },
  {
    id: 'hybrid_lecture',
    label: 'hybrid lecture',
    schema_template: 'hybrid_lecture',
    latency_ms: 30,
    jitter_ms: 5,
    packet_loss_pct: 0.8,
    throughput_mbps: 40,
    reliability: 0.97,
    continuity_class: 'session_hold',
    compute: 'media_edge',
    privacy_class: 'aggregate_only',
    priority_class: 'interactive',
    provenance: 'configured_planning_assumption',
    uncertainty: 'high',
  },
  {
    id: 'community_event',
    label: 'community event',
    schema_template: 'classroom',
    latency_ms: 50,
    jitter_ms: 10,
    packet_loss_pct: 2,
    throughput_mbps: 20,
    reliability: 0.9,
    continuity_class: 'best_effort',
    compute: 'none',
    privacy_class: 'aggregate_only',
    priority_class: 'standard',
    provenance: 'configured_planning_assumption',
    uncertainty: 'high',
  },
  {
    id: 'hardware_repair',
    label: 'hardware repair',
    schema_template: 'repair_lab',
    latency_ms: 35,
    jitter_ms: 6,
    packet_loss_pct: 1,
    throughput_mbps: 30,
    reliability: 0.96,
    continuity_class: 'lab_hold',
    compute: 'local_bench',
    privacy_class: 'aggregate_only',
    priority_class: 'standard',
    provenance: 'configured_planning_assumption',
    uncertainty: 'high',
  },
  {
    id: 'ai_cloud_lab',
    label: 'AI/cloud lab',
    schema_template: 'industry40',
    latency_ms: 20,
    jitter_ms: 4,
    packet_loss_pct: 0.5,
    throughput_mbps: 80,
    reliability: 0.98,
    continuity_class: 'edge_hold',
    compute: 'edge_gpu_proxy',
    privacy_class: 'aggregate_only',
    priority_class: 'compute',
    provenance: 'configured_planning_assumption',
    uncertainty: 'high',
  },
  {
    id: 'gis_climate',
    label: 'GIS/climate',
    schema_template: 'gis_climate',
    latency_ms: 40,
    jitter_ms: 8,
    packet_loss_pct: 1,
    throughput_mbps: 35,
    reliability: 0.95,
    continuity_class: 'degraded_ok',
    compute: 'gis_cache',
    privacy_class: 'aggregate_only',
    priority_class: 'standard',
    provenance: 'configured_planning_assumption',
    uncertainty: 'high',
  },
  {
    id: 'industry40',
    label: 'Industry 4.0 sensor workload',
    schema_template: 'industry40',
    latency_ms: 15,
    jitter_ms: 3,
    packet_loss_pct: 0.4,
    throughput_mbps: 50,
    reliability: 0.99,
    continuity_class: 'sensor_hold',
    compute: 'edge_plc_proxy',
    privacy_class: 'aggregate_only',
    priority_class: 'control_adjacent',
    provenance: 'configured_planning_assumption',
    uncertainty: 'high',
  },
  {
    id: 'design_prototyping',
    label: 'design/prototyping',
    schema_template: 'industry40',
    latency_ms: 25,
    jitter_ms: 5,
    packet_loss_pct: 0.7,
    throughput_mbps: 45,
    reliability: 0.96,
    continuity_class: 'studio_hold',
    compute: 'cad_cache',
    privacy_class: 'aggregate_only',
    priority_class: 'standard',
    provenance: 'configured_planning_assumption',
    uncertainty: 'high',
  },
  {
    id: 'media_collaboration',
    label: 'media collaboration',
    schema_template: 'media_collaboration',
    latency_ms: 25,
    jitter_ms: 4,
    packet_loss_pct: 0.5,
    throughput_mbps: 70,
    reliability: 0.97,
    continuity_class: 'session_hold',
    compute: 'media_edge',
    privacy_class: 'aggregate_only',
    priority_class: 'interactive',
    provenance: 'configured_planning_assumption',
    uncertainty: 'high',
  },
  {
    id: 'offline_recovery',
    label: 'offline/recovery',
    schema_template: 'offline_recovery',
    latency_ms: 80,
    jitter_ms: 15,
    packet_loss_pct: 3,
    throughput_mbps: 8,
    reliability: 0.85,
    continuity_class: 'offline_first',
    compute: 'offline_cache',
    privacy_class: 'abstract_zone',
    priority_class: 'continuity',
    provenance: 'configured_planning_assumption',
    uncertainty: 'high',
  },
  {
    id: 'ntn_remote',
    label: 'NTN/remote sensing',
    schema_template: 'ntn_remote_sensing',
    latency_ms: 250,
    jitter_ms: 40,
    packet_loss_pct: 2,
    throughput_mbps: 5,
    reliability: 0.8,
    continuity_class: 'ntn_fallback',
    compute: 'store_and_forward',
    privacy_class: 'site_level',
    priority_class: 'remote',
    provenance: 'configured_planning_assumption',
    uncertainty: 'high',
  },
]);

export const MATERIAL_ASSUMPTIONS = Object.freeze([
  { id: 'concrete', label: 'concrete', profile: 'n78_planning', model: 'extra_8db', provenance: 'configured', evidence_class: 'CONFIGURED_ASSUMPTION', uncertainty: 'high', assumption: true },
  { id: 'glass', label: 'glass', profile: 'n78_planning', model: 'extra_3db', provenance: 'configured', evidence_class: 'CONFIGURED_ASSUMPTION', uncertainty: 'high', assumption: true },
  { id: 'steel', label: 'steel', profile: 'n78_planning', model: 'extra_12db', provenance: 'configured', evidence_class: 'CONFIGURED_ASSUMPTION', uncertainty: 'high', assumption: true },
  { id: 'drywall', label: 'drywall/light partition', profile: 'n78_planning', model: 'extra_4db', provenance: 'configured', evidence_class: 'CONFIGURED_ASSUMPTION', uncertainty: 'high', assumption: true },
  { id: 'open', label: 'open area', profile: 'n78_planning', model: 'extra_1db', provenance: 'configured', evidence_class: 'CONFIGURED_ASSUMPTION', uncertainty: 'high', assumption: true },
  { id: 'custom', label: 'custom', profile: 'n78_planning', model: 'user_supplied', provenance: 'configured', evidence_class: 'CONFIGURED_ASSUMPTION', uncertainty: 'high', assumption: true },
]);

export const CANDIDATE_KINDS = Object.freeze([
  { id: 'ap', label: 'AP', role: 'indoor_ap', planning_only: true },
  { id: 'gnb', label: 'gNB/radio node', role: 'outdoor_small_cell', planning_only: true },
  { id: 'antenna', label: 'antenna', role: 'indoor_ap', planning_only: true },
  { id: 'edge', label: 'edge compute', role: 'edge_compute', planning_only: true },
  { id: 'backhaul', label: 'backhaul endpoint', role: 'indoor_ap', planning_only: true },
  { id: 'ups', label: 'UPS/power-resilience node', role: 'edge_compute', planning_only: true },
]);

export function proposalActionLabel() {
  return ALLOWED_PROPOSAL_ACTION;
}

export function forbiddenApplyWords() {
  return [...FORBIDDEN_APPLY_WORDS];
}

export function ricDisplayState(requested) {
  if (RIC_ALLOWED_STATES.includes(requested)) return { state: requested, enabled: true };
  if (RIC_DISABLED_STATES.includes(requested)) {
    return { state: requested, enabled: false, reason: 'disabled_until_independently_proven' };
  }
  return { state: 'SIMULATION ONLY', enabled: true };
}

export function noDirectBrowserActuation(surface) {
  const text = JSON.stringify(surface || {});
  const banned = /e2_|srsran|openairinterface|\boai\b|o-ran sc|ran.?credential|browser.?actu/i;
  return {
    NO_DIRECT_BROWSER_ACTUATION_PASS: !banned.test(text),
    REAL_ACTUATION_ENABLED: false,
    credentials_present: false,
  };
}

export function descriptiveGrouping(alt) {
  const o = alt?.objectives || {};
  if ((o.planning_cost_proxy ?? 99) <= 16) return 'lower infrastructure cost proxy';
  if ((o.jains_fairness ?? 0) >= 0.98 && (o.service_continuity ?? 0) >= 0.9) return 'stronger fairness';
  if ((o.service_continuity ?? 0) >= 0.95 || (o.recovery_time ?? 99) <= 15) return 'stronger resilience';
  return 'balanced configured objective';
}

export function recommendationFromAlternative(alt, campusSlug) {
  return {
    recommended_action: `Approve ${alt.alternative_id} for DIGITAL SHADOW`,
    reason: descriptiveGrouping(alt),
    affected_zone_service: campusSlug,
    predicted_benefit: OBJECTIVE_FIELDS.filter((k) => typeof alt.objectives?.[k] === 'number')
      .slice(0, 4)
      .map((k) => `${k}=${alt.objectives[k]}`)
      .join(', '),
    uncertainty: alt.objectives?.uncertainty ?? 'high',
    constraints: 'PLANNING ONLY. No physical apply.',
    evidence_source: 'OFFLINE DEMO / SYNTHETIC',
    status: 'open',
    allowed_actions: ['Inspect', 'Compare', 'Dismiss', 'Approve for DIGITAL SHADOW'],
  };
}
