export type {
  CampusSceneDefinition,
  ModulePlacement,
  PhaseTier,
  ProgramZoneDef,
  ArchitectureModuleKind,
  Vec3,
} from './types';
export { resolvePhaseTier, phaseAtLeast } from './types';
export { CAMPUS_SCENES, SCENE_SLUGS, sceneSignature, massingFingerprint } from './scenes';
export { default as CampusArchitecture } from './CampusArchitecture';
