import {
  WORLD_GRAPH as RAW_WORLD_GRAPH,
  WORLD_ENTRY_SCENES as RAW_WORLD_ENTRY_SCENES,
  assertWorldGraph,
  canonicalCampusSlug as canonicalCampusSlugRaw,
  reachableSceneIds,
  validateWorldGraph,
} from './worldGraph.mjs';
import type {
  CanonicalCampusSlug,
  WorldDefinition,
  WorldEntry,
  WorldId,
  WorldSceneId,
} from './types';

export type { AuthoredProp, WorldDefinition } from './types';

/**
 * The plain-JS graph is shared with Node acceptance tests. This typed adapter is
 * the only definition source consumed by the React runtime.
 */
export const WORLD_GRAPH = RAW_WORLD_GRAPH as unknown as Record<WorldSceneId, WorldDefinition>;
export const WORLD_ENTRY_SCENES = RAW_WORLD_ENTRY_SCENES as Record<WorldId, WorldSceneId>;

export { assertWorldGraph, reachableSceneIds, validateWorldGraph };

export function canonicalCampusSlug(slug: string): CanonicalCampusSlug | null {
  return canonicalCampusSlugRaw(slug) as CanonicalCampusSlug | null;
}

export function sceneById(sceneId: string): WorldDefinition | undefined {
  return WORLD_GRAPH[sceneId as WorldSceneId];
}

export function scenesForWorld(worldId: WorldId): WorldDefinition[] {
  return Object.values(WORLD_GRAPH).filter((scene) => scene.id === worldId);
}

export function campusScenesForSlug(slug: string): WorldDefinition[] {
  const canonical = canonicalCampusSlug(slug);
  return canonical
    ? Object.values(WORLD_GRAPH).filter((scene) => scene.campusSlug === canonical)
    : [];
}

export function entrySceneForWorld(entry: WorldEntry, campusSlug = 'gary'): WorldDefinition {
  if (entry === 'CAMPUS') return worldForCampusSlug(campusSlug);
  return WORLD_GRAPH[WORLD_ENTRY_SCENES[entry]];
}

export const COMMONS_WORLD = WORLD_GRAPH.commons;
export const HOME_WORLD = WORLD_GRAPH['home-yard'];
export const TRANSIT_WORLD = WORLD_GRAPH.transit;
export const GALLERY_WORLD = WORLD_GRAPH['gallery-lobby'];

/**
 * Seven canonical campuses only. Ruhr is the display identity for the existing
 * Germany catalog route; `worldForCampusSlug('ruhr')` resolves it without an
 * eighth campus. Gaza has no sensitive coordinates and Graham Land carries the
 * explicit no WAIKE-owned Antarctic facility truth state in the graph.
 */
export const CAMPUS_WORLDS: Record<CanonicalCampusSlug, WorldDefinition> = {
  gary: WORLD_GRAPH['gary-arrival'],
  ghana: WORLD_GRAPH['ghana-arrival'],
  guyana: WORLD_GRAPH['guyana-arrival'],
  geelong: WORLD_GRAPH['geelong-arrival'],
  germany: WORLD_GRAPH['germany-arrival'],
  gaza: WORLD_GRAPH['gaza-arrival'],
  'graham-land': WORLD_GRAPH['graham-land-arrival'],
};

export function worldForCampusSlug(slug: string): WorldDefinition {
  const canonical = canonicalCampusSlug(slug);
  return canonical ? CAMPUS_WORLDS[canonical] : CAMPUS_WORLDS.gary;
}
