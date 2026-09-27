export const SOURCE_DOC: string;
export const TRUTH_STATES: readonly string[];
export const COVERAGE_STATES: readonly string[];
export const EVIDENCE_STATES: readonly string[];
export const WAIKE_CONTRACT_SURFACES: readonly string[];
export const TOP_LEVEL_SITES: readonly string[];
export const CAMPUS_LANDING: ReadonlyArray<{ id: string; label: string; route: string }>;
export const EXAMPLE_REQUIREMENT_IDS: readonly string[];
export const SPECIALIST_WAIKE_TRACKS: Record<string, string>;

export interface CampusRoom {
  key: string;
  name: string;
  kind: string;
  function: string;
  waike: string[];
  specialist: boolean;
  coverage: string;
  evidence: string;
  geometry?: string;
}

export interface CampusPhase {
  id: string;
  token: string;
  label: string;
}

export interface CampusNode {
  id: string;
  slug: string;
  name: string;
  atlas_name: string;
  planning_identity: string;
  planning_model: string;
  local_focus: string;
  truth_state: string;
  character: string[];
  wayfinding: string[];
  avoid: string[];
  layout: string;
  suppress_coordinates?: boolean;
  suppress_sensitive_locations?: boolean;
  no_fake_station_claim?: boolean;
  remote_first?: boolean;
  phases: CampusPhase[];
  rooms: Record<string, CampusRoom[]>;
  extra_shared?: CampusRoom[];
  twin_layers?: CampusRoom[];
}

export const CAMPUS_CATALOG: CampusNode[];
export const SHARED_PROGRAM: CampusRoom[];

export interface CampusRequirement {
  id: string;
  campus_id: string;
  key: string;
  name: string;
  kind: string;
  function: string;
  specialist: boolean;
  digital_route: string;
  digital_object: string;
  waike_links: string[];
  coverage: string;
  evidence_status: string;
  phase: string;
  phase_token: string;
}

export function campusBySlug(slug: string): CampusNode | null;
export function campusById(id: string): CampusNode | null;
export function roomsAvailableAtPhase(campus: CampusNode, phaseId: string): CampusRoom[];
export function expandCampusRequirements(campus: CampusNode): CampusRequirement[];
export function buildSourceManifest(): { node_count: number; requirement_count: number; campuses: unknown[] };
export function consumeWaikeContract(adapter: { readSurfaces: () => Record<string, { items?: unknown[]; available?: boolean }> } | null): {
  bound: boolean;
  reason: string | null;
  surfaces: Record<string, { id: string; items: unknown[]; available: boolean }>;
};
export function specialistWaikeDeepLink(trackId: string): string | null;
export function galleryPublicOnly<T extends { visibility: string; deleted_at?: string | null }>(nodes: T[]): T[];
export function createStudyRoom(input: { ownerId: string; name?: string; acl?: string[] }): {
  id: string; owner_id: string; name: string; acl: string[]; kind: string; unlimited: boolean;
};
export function studyRoomAclAllows(input: { room: { owner_id?: string; acl?: string[] }; actor?: { id: string } | null }): boolean;
export function friendDoesNotGrantStudyAccess(input: { room: { owner_id?: string; acl?: string[] }; friendId: string }): boolean;
export function createPrivateWorkingCopy<T extends { id: string; metadata?: Record<string, unknown> }>(
  node: T,
  actor: { id: string },
): { ok: true; node: T & { visibility: 'private'; owner_id: string; parent_id: string; metadata: Record<string, unknown> } } | { ok: false; reason: string };

export const NETWORK_LAYERS: readonly string[];
export const DEFAULT_NETWORK_LAYER: string;
export const EVIDENCE_CLASSES: readonly string[];
export const OBJECTIVE_FIELDS: readonly string[];
export const RIC_ALLOWED_STATES: readonly string[];
export const RIC_DISABLED_STATES: readonly string[];
export const DIGITAL_SHADOW_TIMELINE: readonly string[];
export const CANDIDATE_KINDS: ReadonlyArray<{ id: string; label: string; role: string; planning_only: boolean }>;
export const MATERIAL_ASSUMPTIONS: ReadonlyArray<{
  id: string; label: string; profile: string; model: string; provenance: string; evidence_class: string; uncertainty: string; assumption: boolean;
}>;
export const SERVICE_INTENT_TEMPLATES: ReadonlyArray<{
  id: string; label: string; schema_template: string; latency_ms: number; jitter_ms: number; packet_loss_pct: number;
  throughput_mbps: number; reliability: number; continuity_class: string; compute: string; privacy_class: string;
  priority_class: string; provenance: string; uncertainty: string;
}>;
export function exportCampusDesignBundle(slug: string, options?: Record<string, string>): {
  ok: boolean;
  reason?: string | null;
  campus_identity?: string;
  document?: {
    source_manifest_sha256: string;
    evidence_class: string;
    phase: string;
    geometry_fidelity: string;
    zones: Array<{
      campus_requirement_id: string;
      digital_route: string;
      digital_object: string;
      kind: string;
      service_intent_template: string;
      geometry_fidelity: string;
    }>;
    candidate_infrastructure: Array<{
      node_id: string; role: string; height_m_assumption: number; power_dbm_bound: number;
      backhaul: string; orientation_assumption: string; band_profile: string;
    }>;
  };
};
export function consumeOptimizationDocument(doc: unknown, site?: string): {
  ok: boolean;
  document?: { alternatives?: Array<{ alternative_id: string; label: string; objectives: Record<string, number> }>; input_design_hash?: string };
  recommendations: Array<{ recommended_action: string; reason: string; constraints: string; evidence_source: string; allowed_actions: string[] }>;
  label: string;
};
export function descriptiveGrouping(alt: { objectives?: Record<string, number> }): string;
export function geometryDisclaimer(): string;
export function predictedMeasuredLabel(evidenceClass: string): string;
export function proposalActionLabel(): string;
export function ricDisplayState(requested: string): { state: string; enabled: boolean; reason?: string };
export function syntheticLoopLabel(): string;
export function unboundWaikeCampus(): {
  readiness: { ready: number; partial: number };
  consumer_summary: { mode: string };
};
