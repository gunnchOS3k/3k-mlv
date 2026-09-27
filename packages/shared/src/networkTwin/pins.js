/** Live backend / WAIKE pins consumed by this MLV child. Do not mutate those PRs. */

export const SOURCE_MANIFEST_SHA256 =
  '520cbba99541b1505ebba899a2f34bfa905eadd7af8f5b5e8fa050c884067be1';

export const PARENT_PR2 = Object.freeze({
  repo: 'gunnchOS3k/3k-mlv',
  number: 2,
  branch: 'world/home-7gc-campus-gallery-v2',
  head: '5ce416d25f7821ee5506be1a60fd30315372956c',
  base: 'revival/gunnchos-world-workspace-v1',
  base_sha: '5e99c64673557efe7cbdfbbfb4d4ebcdcabfaab7',
});

export const BACKEND_PINS = Object.freeze({
  field_kit: {
    repo: 'gunnchOS3k/gunnchos-7gc-ai-ran-field-kit',
    number: 120,
    branch: 'integration/7gc-campus-airan-closed-loop-v2',
    head: 'f7ca0bacbea33f3a97e550cf3c8c28e5dc6928f9',
  },
  digital_twin: {
    repo: 'gunnchOS3k/7gc-digital-twin',
    number: 33,
    branch: 'integration/mlv-campus-network-twin-v2',
    head: '1d3c159ed942bb499a83af0c4e1533bf439a5970',
  },
  spectrumx: {
    repo: 'gunnchOS3k/spectrumx-ai-ran-gary',
    number: 104,
    branch: 'integration/7gc-planning-ric-loop-v2',
    head: 'bffa5161de5b8f3118e89f210f43f375e6cde717',
  },
  edge_io: {
    repo: 'gunnchOS3k/edge-io-measurement-node',
    number: 41,
    branch: 'integration/campus-calibration-evidence-v2',
    head: '1af382b489732d4dfa745f67eef9ee61ec1ba9a4',
  },
});

export const WAIKE_PIN = Object.freeze({
  repo: 'gunnchOS3k/gunnchos-waike-learning-platform',
  number: 25,
  branch: 'product/learner-first-adoption-parity-v1',
  head: 'f0176c2c45c1c366ad22f46407e6c55c3c5f3e8e',
  imported: '18/18',
  ready: 16,
  partial: 2,
  partial_ids: Object.freeze(['DIGITAL_CONFIDENCE', 'IT_SUPPORT_HARDWARE']),
  consumer_summary_endpoint: '/api/v1/mlv/consumer-summary',
});

export const EXAMPLE_NETWORK_ZONE_IDS = Object.freeze([
  'GARY.FULL.HARDWARE_REPAIR_LAB',
  'GHANA.FULL.MENTOR_WORKSPACE',
  'GUYANA.FULL.CLIMATE_GIS_STUDIO',
  'GEELONG.FULL.DESIGN_BUILD_STUDIO',
  'GERMANY.FULL.INDUSTRY40_TWIN_LAB',
  'GAZA.RECOVERY.OFFLINE_LEARNING_STUDIO',
  'GRAHAM.FULL.NTN_LAB',
]);

export const NETWORK_LAYERS = Object.freeze([
  'Campus',
  'Connectivity',
  'Coverage',
  'Capacity',
  'Infrastructure',
  'Edge Compute',
  'Resilience',
  'Failure Scenario',
  'Predicted vs Measured',
  'Evidence Confidence',
]);

export const DEFAULT_NETWORK_LAYER = 'Campus';

export const EVIDENCE_CLASSES = Object.freeze([
  'SIMULATED',
  'OPEN_DATA_BACKED',
  'CONFIGURED_ASSUMPTION',
  'CONTROLLED_DEVICE_MEASUREMENT',
  'SDR_MEASURED',
  'LAB_INSTRUMENT_MEASURED',
  'RAN_TELEMETRY_MEASURED',
  'FIELD_VALIDATED',
  'MIXED',
]);

export const RIC_ALLOWED_STATES = Object.freeze([
  'SIMULATION ONLY',
  'READ ONLY',
  'RECOMMENDATION ONLY',
  'SHADOW',
]);

export const RIC_DISABLED_STATES = Object.freeze([
  'AUTHORIZED TESTBED',
  'PRODUCTION',
]);

export const OBJECTIVE_FIELDS = Object.freeze([
  'coverage',
  'capacity',
  'latency',
  'jitter',
  'packet_loss',
  'spectral_efficiency',
  'unmet_demand',
  'jains_fairness',
  'zone_service_gap',
  'energy',
  'service_continuity',
  'recovery_time',
  'edge_compute_utilization',
  'planning_cost_proxy',
  'installation_complexity_proxy',
  'constraint_violations',
  'uncertainty',
]);

export const DIGITAL_SHADOW_TIMELINE = Object.freeze([
  'Campus V2 Source Model',
  'Network Design Run',
  'Optimization Result',
  'Digital Proposal Revision',
  'future As-Built',
  'future Commissioning Session',
  'future Calibration',
  'future Operations Snapshot',
]);

export const FORBIDDEN_APPLY_WORDS = Object.freeze([
  'Apply to Network',
  'Push to RIC',
  'Deploy Radio',
]);

export const ALLOWED_PROPOSAL_ACTION = 'Apply to Digital Proposal';
