import type { WorldId, WorldInteractable } from './types';
import type { AABB } from './CollisionWorld';

export type AuthoredProp = {
  id: string;
  kind: 'wall' | 'roof' | 'door' | 'window' | 'furniture' | 'fixture' | 'wayfinding' | 'stair';
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  rotationY?: number;
};

export type WorldDefinition = {
  id: WorldId;
  title: string;
  identity: string;
  spawn: [number, number, number];
  props: AuthoredProp[];
  collisions: AABB[];
  interactables: WorldInteractable[];
  rooms: string[];
};

function wall(id: string, x: number, z: number, w: number, d: number, h = 2.4, color = '#8b7355'): AuthoredProp {
  return { id, kind: 'wall', position: [x, h / 2, z], size: [w, h, d], color };
}

function furniture(id: string, x: number, y: number, z: number, size: [number, number, number], color: string): AuthoredProp {
  return { id, kind: 'furniture', position: [x, y, z], size, color };
}

export const HOME_WORLD: WorldDefinition = {
  id: 'HOME',
  title: 'Home',
  identity: 'owner residence / media life loop',
  spawn: [0, 0, 6],
  rooms: ['ENTRY', 'LIVING', 'MEDIA_ROOM', 'STUDY', 'PRIVATE_FILES'],
  props: [
    wall('home_front', 0, -0.2, 8, 0.25),
    wall('home_back', 0, -6.2, 8, 0.25),
    wall('home_left', -4, -3.2, 0.25, 6.2),
    wall('home_right', 4, -3.2, 0.25, 6.2),
    { id: 'roof', kind: 'roof', position: [0, 2.7, -3.2], size: [8.4, 0.3, 6.6], color: '#5c4030' },
    { id: 'door_front', kind: 'door', position: [0, 1.1, -0.05], size: [1.1, 2.2, 0.12], color: '#3f2a1d' },
    { id: 'window_l', kind: 'window', position: [-2.2, 1.4, -0.08], size: [1.2, 1.0, 0.08], color: '#93c5fd' },
    { id: 'window_r', kind: 'window', position: [2.2, 1.4, -0.08], size: [1.2, 1.0, 0.08], color: '#93c5fd' },
    furniture('sofa', -2.2, 0.4, -2.2, [2.2, 0.8, 0.9], '#6b4f3a'),
    furniture('desk', 2.0, 0.55, -4.4, [1.8, 0.12, 0.8], '#7a4e2d'),
    furniture('dock_chair', 2.0, 0.35, -3.6, [0.55, 0.7, 0.55], '#2f2f2f'),
    furniture('screen', 2.0, 1.2, -4.75, [1.2, 0.75, 0.08], '#111827'),
    furniture('study_desk', -2.2, 0.55, -4.6, [1.4, 0.12, 0.7], '#8b5a2b'),
    furniture('private_cabinet', 0, 0.7, -5.7, [1.2, 1.4, 0.4], '#374151'),
    { id: 'way_media', kind: 'wayfinding', position: [2.0, 2.1, -3.8], size: [0.8, 0.2, 0.05], color: '#fbbf24' },
  ],
  collisions: [
    { id: 'front_wall', min: [-4, 0, -0.4], max: [-0.7, 2.4, 0.1] },
    { id: 'front_wall_r', min: [0.7, 0, -0.4], max: [4, 2.4, 0.1] },
    { id: 'back_wall', min: [-4, 0, -6.4], max: [4, 2.4, -5.9] },
    { id: 'left_wall', min: [-4.2, 0, -6.2], max: [-3.8, 2.4, 0] },
    { id: 'right_wall', min: [3.8, 0, -6.2], max: [4.2, 2.4, 0] },
  ],
  interactables: [
    { id: 'door_front', verb: 'OPEN', capability: 'DOOR', accessPolicy: 'PRIVATE', worldReturnAnchor: 'HOME_ENTRY', loadingPolicy: 'INLINE', accessibilityAlternative: 'Enter Home', position: [0, 0, 0.4], label: 'Front door' },
    { id: 'dock_chair', verb: 'SIT', capability: 'SEAT', accessPolicy: 'PRIVATE', worldReturnAnchor: 'DOCK_CHAIR', loadingPolicy: 'INLINE', accessibilityAlternative: 'Sit at Media Room dock', position: [2.0, 0, -3.6], label: 'Dock chair' },
    { id: 'dock_device', verb: 'LAUNCH', capability: 'APP_LAUNCH', destination: 'com.gunnchos.animeaggressors', accessPolicy: 'PRIVATE', worldReturnAnchor: 'DOCK_CHAIR', loadingPolicy: 'EXTERNAL_APP', accessibilityAlternative: 'Open Anime Aggressors from dock', position: [2.0, 0, -4.4], label: 'Dockable device' },
    { id: 'screen', verb: 'POWER', capability: 'ROOM_TRANSITION', destination: 'MEDIA_ROOM', accessPolicy: 'PRIVATE', worldReturnAnchor: 'MEDIA_SCREEN', loadingPolicy: 'INLINE', accessibilityAlternative: 'Toggle Media Room screen', position: [2.0, 0, -4.6], label: 'Media screen' },
    { id: 'private_files', verb: 'INSPECT', capability: 'PRIVATE_FILE', destination: 'home-private', accessPolicy: 'PRIVATE', worldReturnAnchor: 'PRIVATE_FILES', loadingPolicy: 'PANEL', accessibilityAlternative: 'Open private file cabinet', position: [0, 0, -5.4], label: 'Private files' },
    { id: 'gallery_shortcut', verb: 'OPEN', capability: 'GALLERY_EXHIBIT', destination: '#/mlv/gallery', accessPolicy: 'SHARED', worldReturnAnchor: 'HOME_STUDY', loadingPolicy: 'FULLSCREEN', accessibilityAlternative: 'Go to Gallery', position: [-2.2, 0, -4.4], label: 'Gallery shortcut' },
  ],
};

function campusShell(id: WorldId, title: string, identity: string, accent: string, rooms: string[], extra: WorldInteractable[]): WorldDefinition {
  const props: AuthoredProp[] = [
    wall('facade', 0, -1, 12, 0.3, 3.2, accent),
    wall('back', 0, -10, 12, 0.3, 3.2, accent),
    wall('left', -6, -5.5, 0.3, 9.2, 3.2, accent),
    wall('right', 6, -5.5, 0.3, 9.2, 3.2, accent),
    { id: 'roof', kind: 'roof', position: [0, 3.4, -5.5], size: [12.6, 0.35, 9.6], color: '#44403c' },
    { id: 'entry', kind: 'door', position: [0, 1.3, -0.85], size: [1.6, 2.6, 0.15], color: '#1f2937' },
    { id: 'plaza', kind: 'wayfinding', position: [0, 0.05, 2], size: [8, 0.08, 4], color: '#a8a29e' },
    furniture('hall_bench', -3, 0.35, -3, [2, 0.7, 0.6], '#78716c'),
    furniture('locker', 3.5, 0.9, -4, [1.2, 1.8, 0.5], '#334155'),
    furniture('console', -3.5, 0.7, -7.5, [1.4, 1.0, 0.6], '#0f766e'),
    { id: 'stair', kind: 'stair', position: [4.5, 0.4, -7], size: [1.4, 0.8, 2.2], color: '#57534e' },
  ];
  return {
    id, title, identity, spawn: [0, 0, 4], rooms, props,
    collisions: [
      { id: 'facade_l', min: [-6, 0, -1.2], max: [-1.0, 3.2, -0.7] },
      { id: 'facade_r', min: [1.0, 0, -1.2], max: [6, 3.2, -0.7] },
      { id: 'back', min: [-6, 0, -10.2], max: [6, 3.2, -9.7] },
    ],
    interactables: [
      { id: `${id}_entry`, verb: 'ENTER', capability: 'DOOR', accessPolicy: 'PUBLIC', worldReturnAnchor: `${id}_ENTRY`, loadingPolicy: 'INLINE', accessibilityAlternative: `Enter ${title}`, position: [0, 0, 0], label: 'Campus entry' },
      { id: `${id}_locker`, verb: 'OPEN', capability: 'WAIKE_LEARNER', destination: 'waike://learner/locker', accessPolicy: 'AUTHENTICATED', worldReturnAnchor: `${id}_LOCKER`, loadingPolicy: 'PANEL', accessibilityAlternative: 'Open personal WAIKE locker', position: [3.5, 0, -3.6], label: 'Personal locker' },
      { id: `${id}_network`, verb: 'USE', capability: 'NETWORK_TWIN', destination: `#/mlv/campus/${String(id).toLowerCase().replace('_','-')}/network-twin`, accessPolicy: 'AUTHENTICATED', worldReturnAnchor: `${id}_NET`, loadingPolicy: 'FULLSCREEN', accessibilityAlternative: 'Open Network Twin Lab', position: [-3.5, 0, -7.2], label: 'Network Twin console' },
      ...extra,
    ],
  };
}

export const CAMPUS_WORLDS: Record<string, WorldDefinition> = {
  gary: campusShell('GARY', 'Gary', 'civic-industrial learning hall', '#a16207', ['PLAZA','CIVIC_HALL','LOCKER_HALL','LIBRARY','STUDY','LECTURE','MEDIA','DEVICE_LAB','NETWORK_TWIN','GALLERY','COMMUNITY'], [
    { id: 'gary_library', verb: 'ENTER', capability: 'ROOM_TRANSITION', destination: 'LIBRARY', accessPolicy: 'PUBLIC', worldReturnAnchor: 'GARY_LIBRARY', loadingPolicy: 'INLINE', accessibilityAlternative: 'Enter Library', position: [-4, 0, -5], label: 'Library' },
    { id: 'gary_lecture', verb: 'ENTER', capability: 'ROOM_TRANSITION', destination: 'LECTURE', accessPolicy: 'PUBLIC', worldReturnAnchor: 'GARY_LECTURE', loadingPolicy: 'INLINE', accessibilityAlternative: 'Enter Lecture Hall', position: [4, 0, -6], label: 'Lecture Hall' },
  ]),
  ghana: campusShell('GHANA', 'Ghana', 'shaded courtyard / learning pavilion', '#d6c7a1', ['COURTYARD','PAVILION','DEVICE_BAR','REPAIR_LAB','MENTOR','COMMUNITY','MEDIA'], []),
  guyana: campusShell('GUYANA', 'Guyana', 'raised climate-resilience spine', '#0e7490', ['SPINE','GIS_STUDIO','ENERGY_STUDIO','HARDWARE_LAB','DASHBOARD'], []),
  geelong: campusShell('GEELONG', 'Geelong', 'workshop / maker yard', '#92400e', ['YARD','DESIGN_STUDIO','ROBOTICS','CLEAN_ENERGY','HEALTH_TECH','SHOWCASE'], []),
  germany: campusShell('GERMANY', 'Germany / Ruhr', 'apprenticeship / Industry 4.0 hall', '#6b7280', ['APPRENTICE_HALL','I4_LAB','STANDARDS','CYBER_LAB','COMMONS','LOGISTICS'], []),
  gaza: {
    ...campusShell('GAZA', 'Gaza', 'distributed recovery-learning network (no precise sensitive coords)', '#d6d3d1', ['LEARNING_NODE','REPAIR_NODE','SOLAR_ZONE','SECURE_STORAGE','RECONSTRUCTION_DOCS','MENTOR_NODE','QUIET_SPACE'], [
      { id: 'gaza_node', verb: 'ENTER', capability: 'ROOM_TRANSITION', destination: 'LEARNING_NODE', accessPolicy: 'PUBLIC', worldReturnAnchor: 'GAZA_NODE', loadingPolicy: 'INLINE', accessibilityAlternative: 'Enter temporary learning node', position: [0, 0, -3], label: 'Temporary learning node' },
    ]),
    identity: 'distributed recovery-learning network — no conventional permanent campus; no sensitive coordinates',
  },
  'graham-land': {
    ...campusShell('GRAHAM_LAND', 'Graham Land', 'remote polar research education twin (no WAIKE-owned station claim)', '#e2e8f0', ['CLIMATE_LAB','GIS','SENSOR_BENCH','NTN_COMMS','CYBER','FIELD_SAFETY','OPS','EXHIBIT'], [
      { id: 'polar_ops', verb: 'ENTER', capability: 'ROOM_TRANSITION', destination: 'OPS', accessPolicy: 'PUBLIC', worldReturnAnchor: 'POLAR_OPS', loadingPolicy: 'INLINE', accessibilityAlternative: 'Enter simulated operations room', position: [0, 0, -3], label: 'Operations room' },
    ]),
    identity: 'remote polar research education twin — external station references remain external; no WAIKE-owned Antarctic campus',
  },
};

export const GALLERY_WORLD: WorldDefinition = {
  id: 'GALLERY',
  title: 'Gallery',
  identity: 'walkable cultural + community gallery',
  spawn: [0, 0, 5],
  rooms: ['LOCAL_CULTURE','ROTATING_INSTITUTION','SEVEN_GC_EXCHANGE','PUBLIC_COMMUNITY','MY_GALLERY'],
  props: [
    wall('g_front', 0, -0.5, 14, 0.25, 3.0, '#e7e5e4'),
    wall('g_back', 0, -12, 14, 0.25, 3.0, '#e7e5e4'),
    wall('g_left', -7, -6, 0.25, 11.5, 3.0, '#e7e5e4'),
    wall('g_right', 7, -6, 0.25, 11.5, 3.0, '#e7e5e4'),
    { id: 'g_roof', kind: 'roof', position: [0, 3.2, -6], size: [14.4, 0.25, 12], color: '#a8a29e' },
    wall('wing_a', -2.4, -4.5, 0.16, 6, 2.6, '#d6d3d1'),
    wall('wing_b', 2.4, -4.5, 0.16, 6, 2.6, '#d6d3d1'),
    wall('wing_c', 0, -7.2, 12, 0.16, 2.6, '#d6d3d1'),
    furniture('floor_local', -4.6, 0.04, -3.2, [3.6, 0.04, 4.2], '#c4a484'),
    furniture('floor_institution', 0, 0.04, -3.2, [3.4, 0.04, 4.2], '#e7e5e4'),
    furniture('floor_exchange', 4.6, 0.04, -3.2, [3.6, 0.04, 4.2], '#94a3b8'),
    furniture('floor_public', -3.2, 0.04, -9.2, [5, 0.04, 3.2], '#fef3c7'),
    furniture('floor_mine', 3.2, 0.04, -9.2, [5, 0.04, 3.2], '#1e3a5f'),
    furniture('frame_local', -4.6, 1.5, -5.6, [1.8, 1.5, 0.12], '#92400e'),
    furniture('frame_museum', 0, 1.7, -5.6, [1.4, 2.1, 0.12], '#f5f5f4'),
    furniture('frame_exchange', 4.6, 1.15, -5.6, [2.4, 0.7, 0.35], '#334155'),
    furniture('frame_public', -3.2, 1.35, -10.4, [2.2, 1.3, 0.1], '#fef3c7'),
    furniture('frame_mine', 3.2, 1.2, -10.4, [1.4, 1.6, 0.45], '#1e3a8a'),
  ],
  collisions: [
    { id: 'gf', min: [-7, 0, -0.7], max: [-1, 3, -0.3] },
    { id: 'gfr', min: [1, 0, -0.7], max: [7, 3, -0.3] },
  ],
  interactables: [
    { id: 'local_wing', verb: 'INSPECT', capability: 'GALLERY_EXHIBIT', destination: 'local-culture', accessPolicy: 'PUBLIC', worldReturnAnchor: 'GALLERY_LOCAL', loadingPolicy: 'PANEL', accessibilityAlternative: 'Inspect local culture exhibit', position: [-4, 0, -2.5], label: 'Local Culture Wing' },
    { id: 'museum_wing', verb: 'INSPECT', capability: 'GALLERY_EXHIBIT', destination: 'rotating-institution', accessPolicy: 'PUBLIC', worldReturnAnchor: 'GALLERY_MUSEUM', loadingPolicy: 'PANEL', accessibilityAlternative: 'Inspect rotating institution exhibit', position: [0, 0, -2.5], label: 'Rotating Institution Wing' },
    { id: 'exchange_wing', verb: 'INSPECT', capability: 'GALLERY_EXHIBIT', destination: '7gc-exchange', accessPolicy: 'PUBLIC', worldReturnAnchor: 'GALLERY_EXCHANGE', loadingPolicy: 'PANEL', accessibilityAlternative: 'Inspect 7GC exchange exhibit', position: [4, 0, -2.5], label: '7GC Exchange Wing' },
    { id: 'public_file', verb: 'OPEN', capability: 'PUBLIC_FILE', destination: 'public-community', accessPolicy: 'PUBLIC', worldReturnAnchor: 'GALLERY_PUBLIC', loadingPolicy: 'PANEL', accessibilityAlternative: 'Open PUBLIC community file', position: [-2, 0, -7.5], label: 'Public Community Gallery' },
    { id: 'my_gallery', verb: 'OPEN', capability: 'PRIVATE_FILE', destination: 'my-gallery', accessPolicy: 'PRIVATE', worldReturnAnchor: 'GALLERY_MINE', loadingPolicy: 'PANEL', accessibilityAlternative: 'Open My Gallery (owner-published only)', position: [2, 0, -7.5], label: 'My Gallery' },
  ],
};

export function worldForCampusSlug(slug: string): WorldDefinition {
  return CAMPUS_WORLDS[slug] || CAMPUS_WORLDS.gary;
}
