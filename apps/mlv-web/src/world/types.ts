export type Vec3 = [number, number, number];

export type WorldMode = 'WORLD' | 'MAP' | 'LIST';

export type AccessPolicy = 'PRIVATE' | 'SHARED' | 'PUBLIC' | 'AUTHENTICATED';

export type LoadingPolicy = 'INLINE' | 'FULLSCREEN' | 'EXTERNAL_APP' | 'PANEL';

export type WorldCapability =
  | 'APP_LAUNCH'
  | 'WAIKE_LEARNER'
  | 'PUBLIC_FILE'
  | 'PRIVATE_FILE'
  | 'GALLERY_EXHIBIT'
  | 'NETWORK_TWIN'
  | 'RESEARCH_HANDOFF'
  | 'ROOM_TRANSITION'
  | 'LOGOFF'
  | 'SEAT'
  | 'DOOR';

export type CanonicalCampusSlug =
  | 'gary'
  | 'ghana'
  | 'guyana'
  | 'geelong'
  | 'germany'
  | 'gaza'
  | 'graham-land';

export type CampusSlug = CanonicalCampusSlug | 'ruhr';

export type CampusSceneKind =
  | 'arrival'
  | 'lobby'
  | 'learning'
  | 'research'
  | 'gallery'
  | 'community';

export type HomeSceneId =
  | 'home-yard'
  | 'home-living'
  | 'home-media'
  | 'home-office'
  | 'home-bedroom';

export type GallerySceneId =
  | 'gallery-lobby'
  | 'gallery-local'
  | 'gallery-institution'
  | 'gallery-exchange'
  | 'gallery-public'
  | 'gallery-mine';

export type CampusSceneId = `${CanonicalCampusSlug}-${CampusSceneKind}`;

export type WorldSceneId =
  | 'commons'
  | 'transit'
  | HomeSceneId
  | GallerySceneId
  | CampusSceneId;

export type WorldId =
  | 'COMMONS'
  | 'HOME'
  | 'TRANSIT'
  | 'GARY'
  | 'GHANA'
  | 'GUYANA'
  | 'GEELONG'
  | 'GERMANY'
  | 'GAZA'
  | 'GRAHAM_LAND'
  | 'GALLERY';

/** `CAMPUS` is a route entry selector; persisted state always uses a concrete WorldId. */
export type WorldEntry = WorldId | 'CAMPUS';

export type WorldSceneKind =
  | 'commons'
  | 'transit'
  | 'home-yard'
  | 'home-room'
  | 'gallery-lobby'
  | 'gallery-wing'
  | `campus-${CampusSceneKind}`;

export type WorldTruth = {
  affiliationClaim: false;
  coordinates: null;
  authoredPlanningTwin: true;
  stylizedNotSurveyed?: true;
  suppressSensitiveCoordinates?: true;
  noPermanentCampusClaim?: true;
  noWaikeOwnedStationClaim?: true;
  externalReferencesRemainExternal?: true;
  note: string;
};

export type WorldPortal = {
  id: string;
  from: WorldSceneId;
  to: WorldSceneId;
  reciprocalId: string;
  label: string;
  position: Vec3;
  accessPolicy: AccessPolicy;
  worldReturnAnchor: string;
};

export type WorldInteractable = {
  id: string;
  verb: string;
  capability: WorldCapability;
  destination?: string;
  /** Typed in-world navigation target. External destinations continue to use `destination`. */
  targetScene?: WorldSceneId;
  accessPolicy: AccessPolicy;
  worldReturnAnchor: string;
  loadingPolicy: LoadingPolicy;
  accessibilityAlternative: string;
  position: Vec3;
  label: string;
};

export type AuthoredPropKind =
  | 'ground'
  | 'wall'
  | 'roof'
  | 'door'
  | 'window'
  | 'furniture'
  | 'fixture'
  | 'wayfinding'
  | 'stair'
  | 'canopy'
  | 'column'
  | 'landmark'
  | 'planting'
  | 'art';

export type AuthoredPropShape = 'box' | 'cylinder' | 'sphere' | 'gable';

export type AuthoredProp = {
  id: string;
  kind: AuthoredPropKind;
  position: Vec3;
  size: Vec3;
  color: string;
  shape?: AuthoredPropShape;
  rotationY?: number;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  emissive?: string;
};

export type WorldCollision = {
  id: string;
  min: Vec3;
  max: Vec3;
};

export type WorldDefinition = {
  id: WorldId;
  sceneId: WorldSceneId;
  sceneKind: WorldSceneKind;
  title: string;
  identity: string;
  spawn: Vec3;
  props: AuthoredProp[];
  collisions: WorldCollision[];
  interactables: WorldInteractable[];
  portals: WorldPortal[];
  rooms: string[];
  truth: WorldTruth;
  provenance: string[];
  campusSlug?: CanonicalCampusSlug;
};

export type ReturnContext = {
  world: string;
  zone: string;
  anchor: string;
  avatarPosition: Vec3;
  avatarFacing: number;
  session: string;
};
