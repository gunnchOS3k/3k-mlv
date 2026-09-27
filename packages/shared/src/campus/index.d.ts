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
