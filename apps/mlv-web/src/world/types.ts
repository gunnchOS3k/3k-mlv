export type WorldMode = 'WORLD' | 'MAP' | 'LIST';

export type WorldCapability =
  | 'APP_LAUNCH'
  | 'WAIKE_LEARNER'
  | 'PUBLIC_FILE'
  | 'PRIVATE_FILE'
  | 'GALLERY_EXHIBIT'
  | 'NETWORK_TWIN'
  | 'ROOM_TRANSITION'
  | 'SEAT'
  | 'DOOR';

export type WorldInteractable = {
  id: string;
  verb: string;
  capability: WorldCapability;
  destination?: string;
  accessPolicy: 'PRIVATE' | 'SHARED' | 'PUBLIC' | 'AUTHENTICATED';
  worldReturnAnchor: string;
  loadingPolicy: 'INLINE' | 'FULLSCREEN' | 'EXTERNAL_APP' | 'PANEL';
  accessibilityAlternative: string;
  position: [number, number, number];
  label: string;
};

export type ReturnContext = {
  world: string;
  zone: string;
  anchor: string;
  avatarPosition: [number, number, number];
  avatarFacing: number;
  session: string;
};

export type WorldId =
  | 'HOME'
  | 'GARY'
  | 'GHANA'
  | 'GUYANA'
  | 'GEELONG'
  | 'GERMANY'
  | 'GAZA'
  | 'GRAHAM_LAND'
  | 'GALLERY';
