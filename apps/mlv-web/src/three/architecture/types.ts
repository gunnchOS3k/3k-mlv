/** V4 architectural scene contracts — digital planning interpretations, not surveyed buildings. */

export type PhaseTier = 'pilot' | 'semi' | 'full';

export type Vec3 = [number, number, number];

export type ArchitectureModuleKind =
  | 'terrain'
  | 'street'
  | 'transit'
  | 'water'
  | 'landscape'
  | 'plaza'
  | 'courtyard'
  | 'covered_walk'
  | 'arcade'
  | 'raised_walk'
  | 'workshop_shed'
  | 'learning_hall'
  | 'lab_block'
  | 'community_hall'
  | 'gallery_hall'
  | 'repair_bay'
  | 'solar_canopy'
  | 'media_studio'
  | 'operations'
  | 'temporary_module'
  | 'polar_module'
  | 'antenna'
  | 'gantry'
  | 'bridge'
  | 'wayfinding'
  | 'truth_label'
  | 'program_zone';

export interface ModulePlacement {
  kind: ArchitectureModuleKind;
  id: string;
  position: Vec3;
  rotationY?: number;
  /** Width, height, depth — interpretation varies by module. */
  size: Vec3;
  color?: string;
  accent?: string;
  label?: string;
  /** Minimum phase tier for this volume to appear. */
  fromPhase?: PhaseTier;
  trace?: string;
}

export interface ProgramZoneDef {
  id: string;
  buildingId: string;
  wingId: string;
  programKey: string;
  name: string;
  position: Vec3;
  fromPhase?: PhaseTier;
}

export interface CampusSceneDefinition {
  slug: string;
  silhouette: string;
  sitePlan: string;
  truthNote?: string;
  background: string;
  groundColor: string;
  modules: ModulePlacement[];
  programZones: ProgramZoneDef[];
  /** Distinct massing scale multipliers per phase (not hide/show identical cubes). */
  phaseMassing: Record<PhaseTier, { scale: Vec3; extraModules?: ModulePlacement[] }>;
}

export function resolvePhaseTier(slug: string, phaseId: string): PhaseTier {
  const id = (phaseId || '').toUpperCase();
  if (slug === 'gaza') {
    if (id.includes('RECOVERY_NETWORK') || id === 'RECOVERY_NETWORK') return 'pilot';
    if (id.includes('SEMI') || id === 'SEMI_PERMANENT_LEARNING_HUB') return 'semi';
    return 'full';
  }
  if (slug === 'graham-land') {
    if (id.includes('REMOTE') || id === 'REMOTE_LEARNING_LAB') return 'pilot';
    if (id.includes('TWIN') || id === 'DIGITAL_TWIN_PARTNER_HOSTED_STUDIO') return 'semi';
    return 'full';
  }
  if (id === 'PILOT' || id.includes('PILOT') || id === 'REMOTE') return 'pilot';
  if (id.includes('SEMI') || id === 'TWIN') return 'semi';
  return 'full';
}

export function phaseAtLeast(current: PhaseTier, required?: PhaseTier): boolean {
  if (!required) return true;
  const order: PhaseTier[] = ['pilot', 'semi', 'full'];
  return order.indexOf(current) >= order.indexOf(required);
}
