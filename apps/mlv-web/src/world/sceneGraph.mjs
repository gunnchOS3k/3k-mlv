/**
 * Original stylized neighborhood for 3k MLV.
 * Procedural room-to-room scenes. Not a surveyed campus, not a cloned map,
 * and not an institutional endorsement.
 * affiliation_claim stays false. Gaza has no coordinates and no site claim.
 */

/**
 * @deprecated Development-only preservation of the pre-merge neighborhood
 * prototype. Shipping code must consume worldGraph.mjs through WorldRuntime.
 * The exact incoming Cursor diff is preserved outside the repository at the
 * takeover brief's required patch path.
 */
export const LEGACY_DEVELOPMENT_ONLY = true;
export const AFFILIATION_CLAIM = false;

export const HOUSE_EXTERIOR = Object.freeze({
  pitchedRoof: true,
  porch: true,
  windowsWithTrim: true,
  pathToStreet: true,
  mailbox: true,
  planter: true,
  anchor: [-12, 0, 4.15],
  size: [5.5, 2.65, 4.35],
  door: [-12, 0, 6.5],
});

export const COMMONS_LAYOUT = Object.freeze({
  street: { center: [0, 0.05, 0.2], size: [42, 0.08, 3.4] },
  path: { center: [-12, 0.06, 3.7], size: [1.35, 0.06, 5.2] },
  plaza: { center: [1.4, 0.06, -6.4], radius: 4.5 },
  transitDoor: [15.4, 0, 1.55],
});

function portal(id, label, to, position, rotationY = 0, radius = 1.5) {
  return { id, label, to, position, rotationY, radius };
}

function frame(position, lookAt) {
  return { position, lookAt };
}

export const CAMPUSES = [
  {
    id: 'gary',
    catalogSlug: 'gary',
    displayName: 'Gary',
    silhouette: 'civic-hall',
    affiliation_claim: false,
    coordinates: null,
    buildingName: 'Civic Hall',
    museumName: 'Showcase Hall',
    labName: 'Project Lab',
    sky: '#8eb7d6',
    ground: '#6d7d62',
    disclaimer: 'Stylized destination. Not a measured campus.',
    palette: { wall: '#b4532a', roof: '#3e4c59', trim: '#f3d7b5', accent: '#e2b15a', glass: '#9fd4ea' },
    exhibits: ['Shift Whistle', 'Porch Frequency', 'Civic Loom'],
    lobbyDoor: [0, 0, 2.4],
    museumDoor: [7.4, 0, 1.2],
  },
  {
    id: 'ghana',
    catalogSlug: 'ghana',
    displayName: 'Ghana',
    silhouette: 'courtyard',
    affiliation_claim: false,
    coordinates: null,
    buildingName: 'Courtyard Hall',
    museumName: 'Courtyard Gallery',
    labName: 'Mentor Lab',
    sky: '#e2c48a',
    ground: '#c4a36a',
    disclaimer: 'Stylized destination. Not a measured campus.',
    palette: { wall: '#c9843a', roof: '#f2e2b8', trim: '#6b3a22', accent: '#d4a017', glass: '#f7e7c4' },
    exhibits: ['Mentor Shade', 'Courtyard Loom', 'Gold Dust Study'],
    lobbyDoor: [0, 0, 2.6],
    museumDoor: [-6.8, 0, 0.4],
  },
  {
    id: 'guyana',
    catalogSlug: 'guyana',
    displayName: 'Guyana',
    silhouette: 'river-linear',
    affiliation_claim: false,
    coordinates: null,
    buildingName: 'Timber Hall',
    museumName: 'Timber Archive',
    labName: 'Field Classroom',
    sky: '#7eb8c9',
    ground: '#5f8f62',
    disclaimer: 'Stylized destination. Not a measured waterway.',
    palette: { wall: '#d7c4a3', roof: '#1d4e6f', trim: '#f4efe4', accent: '#2f8f8a', glass: '#b7e4ea' },
    exhibits: ['Current Ribbon', 'Timber Ledger', 'Canopy Interval'],
    lobbyDoor: [-1.5, 0, 2.2],
    museumDoor: [2.2, 0, -5.2],
  },
  {
    id: 'geelong',
    catalogSlug: 'geelong',
    displayName: 'Geelong',
    silhouette: 'workshop-yard',
    affiliation_claim: false,
    coordinates: null,
    buildingName: 'Workshop',
    museumName: 'Yard Gallery',
    labName: 'Workshop Classroom',
    sky: '#d7c7a4',
    ground: '#8a7a58',
    disclaimer: 'Stylized destination. Not a measured campus.',
    palette: { wall: '#a36b43', roof: '#6e6256', trim: '#f6edd8', accent: '#d9822b', glass: '#d5e4ea' },
    exhibits: ['Sawtooth Hour', 'Yard Bell', 'Workshop Quilt'],
    lobbyDoor: [0.4, 0, 2.5],
    museumDoor: [8.1, 0, 0.6],
  },
  {
    id: 'ruhr',
    catalogSlug: 'germany',
    displayName: 'Ruhr',
    silhouette: 'grid-halls',
    affiliation_claim: false,
    coordinates: null,
    buildingName: 'Apprentice Hall',
    museumName: 'Apprentice Gallery',
    labName: 'Apprentice Lab',
    sky: '#9aa7b5',
    ground: '#6d7370',
    disclaimer: 'Stylized destination. Not an institutional endorsement.',
    palette: { wall: '#4b5563', roof: '#d97706', trim: '#e7e2d8', accent: '#f0b429', glass: '#c5d4de' },
    exhibits: ['Grid Apprentice', 'Amber Shift', 'Slate Interval'],
    lobbyDoor: [-2.2, 0, 2.3],
    museumDoor: [5.6, 0, 1.4],
  },
  {
    id: 'gaza',
    catalogSlug: 'gaza',
    displayName: 'Gaza',
    silhouette: 'learning-circles',
    affiliation_claim: false,
    coordinates: null,
    suppress_coordinates: true,
    buildingName: 'Learning Circle',
    museumName: 'Learning Archive',
    labName: 'Shared Classroom',
    sky: '#e7d7b4',
    ground: '#d8c39a',
    disclaimer: 'Stylized destination. No coordinates. No site claim.',
    palette: { wall: '#e6d3b0', roof: '#6f8f62', trim: '#5c6b45', accent: '#c47b4a', glass: '#f3ead4' },
    exhibits: ['Olive Circle', 'Quiet Archive', 'Shared Shade'],
    lobbyDoor: [0, 0, 3.1],
    museumDoor: [6.6, 0, 0.2],
  },
  {
    id: 'graham-land',
    catalogSlug: 'graham-land',
    displayName: 'Graham Land',
    silhouette: 'remote-modules',
    affiliation_claim: false,
    coordinates: null,
    buildingName: 'Remote Lab',
    museumName: 'Remote Archive',
    labName: 'Simulation Lab',
    sky: '#d5e4ee',
    ground: '#e7eef2',
    disclaimer: 'Remote stylized lab. Not a surveyed station.',
    palette: { wall: '#d9e3ea', roof: '#5c6f7e', trim: '#243140', accent: '#7eb0c8', glass: '#eef6fb' },
    exhibits: ['Pale Module', 'Simulation Shelf', 'Remote Ledger'],
    lobbyDoor: [-1.2, 0, 2.4],
    museumDoor: [6.2, 0, 0.8],
  },
];

const INTERIOR_BOUNDS = { minX: -4.3, maxX: 4.3, minZ: -3.9, maxZ: 3.9 };

function interiorScene(id, title, blurb, portals, kind = 'house-room') {
  return {
    id,
    kind,
    title,
    blurb,
    sky: kind === 'gallery-wing' ? '#2c2622' : '#3a2a22',
    spawn: [0, 0, 1.4],
    bounds: INTERIOR_BOUNDS,
    frame: frame([0, 2.2, 3.3], [0, 1.2, -1.4]),
    portals,
  };
}

function reviewHouse(id, title, style) {
  return {
    id,
    kind: 'review-house',
    title,
    blurb: 'Owner review model. HOUSE_STYLE_SELECTED is false.',
    sky: '#8eb6d8',
    style,
    spawn: [0, 0, 7.2],
    bounds: { minX: -10, maxX: 10, minZ: -8, maxZ: 10 },
    frame: frame([5.5, 3.8, 9], [0, 1.5, 0]),
    portals: [portal('back', 'Back to Commons', 'commons', [0, 0, 8.4], Math.PI, 1.2)],
    collisions: [{ id: 'review-house', min: [-3.2, 0, -2.6], max: [3.2, 4, 2.2] }],
  };
}

function campusScenes(campus) {
  const exterior = `${campus.id}-exterior`;
  const lobby = `${campus.id}-lobby`;
  const lab = `${campus.id}-lab`;
  const gallery = `${campus.id}-gallery`;
  return {
    [exterior]: {
      id: exterior,
      kind: 'campus-exterior',
      title: `${campus.displayName} arrival`,
      blurb: campus.disclaimer,
      campusId: campus.id,
      sky: campus.sky,
      spawn: [0, 0, 8.2],
      bounds: { minX: -14, maxX: 14, minZ: -12, maxZ: 11 },
      frame: frame([0.2, 5.4, 12.4], [0.4, 1.4, 0]),
      portals: [
        portal('to-lobby', `Enter ${campus.buildingName}`, lobby, campus.lobbyDoor, 0, 1.35),
        portal('to-gallery', `Enter ${campus.museumName}`, gallery, campus.museumDoor, 0, 1.35),
        portal('to-transit', 'Back to campus transit', 'transit', [0, 0, 9.6], Math.PI, 1.4),
      ],
    },
    [lobby]: {
      id: lobby,
      kind: 'campus-lobby',
      title: `${campus.displayName} lobby`,
      blurb: `${campus.buildingName}. Stylized interior.`,
      campusId: campus.id,
      sky: '#1c2430',
      spawn: [0, 0, 1.4],
      bounds: INTERIOR_BOUNDS,
      frame: frame([0, 2.35, 3.35], [0, 1.35, -1.5]),
      portals: [
        portal('to-lab', campus.labName, lab, [-4.35, 0, -0.4], Math.PI / 2, 1.2),
        portal('to-gallery', campus.museumName, gallery, [4.35, 0, -0.4], -Math.PI / 2, 1.2),
        portal('to-exterior', 'Arrival court', exterior, [0, 0, 3.85], Math.PI, 1.2),
      ],
    },
    [lab]: {
      id: lab,
      kind: 'campus-lab',
      title: `${campus.displayName} ${campus.labName}`,
      blurb: 'Learning room. Original stylized interior.',
      campusId: campus.id,
      sky: '#1c2430',
      spawn: [0, 0, 1.2],
      bounds: INTERIOR_BOUNDS,
      frame: frame([0.4, 2.3, 3.2], [0, 1.2, -1.6]),
      portals: [
        portal('to-lobby', 'Back to lobby', lobby, [0, 0, 3.85], Math.PI, 1.2),
      ],
    },
    [gallery]: {
      id: gallery,
      kind: 'campus-gallery',
      title: `${campus.displayName} ${campus.museumName}`,
      blurb: 'Enterable gallery. Original works, not a partner collection.',
      campusId: campus.id,
      sky: '#16141c',
      spawn: [0, 0, 1.5],
      bounds: INTERIOR_BOUNDS,
      frame: frame([0, 2.15, 3.5], [0, 1.55, -2.2]),
      portals: [
        portal('to-lobby', 'Back to lobby', lobby, [-4.35, 0, 0.2], Math.PI / 2, 1.2),
        portal('to-exterior', 'Arrival court', exterior, [0, 0, 3.85], Math.PI, 1.2),
      ],
    },
  };
}

function buildScenes() {
  const scenes = {
    commons: {
      id: 'commons',
      kind: 'commons',
      title: '3k MLV Commons',
      blurb: 'My Home, the Gallery Pavilion, and Campus Transit are buildings in the neighborhood.',
      sky: '#8eb6d8',
      spawn: [0.2, 0, 10.4],
      bounds: { minX: -20, maxX: 20, minZ: -14, maxZ: 12 },
      frame: frame([-4, 10.5, 20], [1.5, 0.6, -1.5]),
      collisions: [
        { id: 'my-home', min: [-15.05, 0, 1.7], max: [-8.95, 4.2, 6.15] },
        { id: 'gallery-pavilion', min: [-2.7, 0, -15.1], max: [5.5, 4, -10.85] },
        { id: 'transit-station', min: [12.6, 0, -2.5], max: [18.2, 4, 1.2] },
        { id: 'neighbor-b', min: [-19.2, 0, -10.4], max: [-13.6, 3.5, -5.4] },
        { id: 'neighbor-c', min: [8.2, 0, -14.2], max: [14.4, 3.8, -8.6] },
      ],
      portals: [
        portal('house-door', 'Enter My Home', 'house-front', HOUSE_EXTERIOR.door, 0, 1.35),
        portal('gallery-door', 'Enter Gallery Pavilion', 'gallery-lobby', [1.4, 0, -10.6], 0, 1.5),
        portal('transit-door', 'Campus transit', 'transit', COMMONS_LAYOUT.transitDoor, 0, 1.45),
      ],
    },
    transit: {
      id: 'transit',
      kind: 'transit',
      title: 'Campus transit plaza',
      blurb: 'Seven stylized destinations. Not measured campuses.',
      sky: '#9ec0db',
      spawn: [0, 0, 7.4],
      bounds: { minX: -14, maxX: 14, minZ: -12, maxZ: 10 },
      frame: frame([0, 6.8, 11.5], [0, 1.5, -3.2]),
      portals: [
        ...CAMPUSES.map((campus) => {
          const gate = transitGate(campus.id);
          return portal(
            `gate-${campus.id}`,
            campus.displayName,
            `${campus.id}-exterior`,
            gate.position,
            0,
            1.35,
          );
        }),
        portal('back-commons', 'Back to Commons', 'commons', [0, 0, 8.8], Math.PI, 1.4),
      ],
    },
    'house-front': {
      id: 'house-front',
      kind: 'house-room',
      title: 'House front room',
      blurb: 'Warm front room off the porch.',
      sky: '#3a2a22',
      spawn: [0, 0, 1.3],
      bounds: INTERIOR_BOUNDS,
      frame: frame([0.2, 2.2, 3.3], [0, 1.2, -1.4]),
      portals: [
        portal('to-media', 'Media Room', 'house-media', [-4.35, 0, -0.6], Math.PI / 2, 1.15),
        portal('to-office', 'Office', 'house-office', [-1.6, 0, -3.85], 0, 1.15),
        portal('to-study', 'Study', 'house-study', [1.6, 0, -3.85], 0, 1.15),
        portal('to-bedroom', 'Bedroom', 'house-bedroom', [4.35, 0, 0.4], -Math.PI / 2, 1.15),
        portal('to-commons', 'Back to the porch', 'commons', [0, 0, 3.85], Math.PI, 1.15),
      ],
    },
    'house-study': {
      id: 'house-study',
      kind: 'house-room',
      title: 'House study',
      blurb: 'Second room. Desk, shelf, and a window.',
      sky: '#3a2a22',
      spawn: [0, 0, 1.2],
      bounds: INTERIOR_BOUNDS,
      frame: frame([-0.4, 2.15, 3.25], [0.6, 1.15, -1.2]),
      portals: [
        portal('to-front', 'Front room', 'house-front', [0, 0, 3.85], Math.PI, 1.15),
      ],
    },
    'house-media': interiorScene('house-media', 'My Home — Media Room', 'Games, music, and first-party entertainment. Nothing private is published from here.', [
      portal('to-front', 'Front room', 'house-front', [0, 0, 3.85], Math.PI, 1.15),
    ]),
    'house-office': interiorScene('house-office', 'My Home — Office', 'Private workbench. Drafts stay private. Friends and visitors cannot open them.', [
      portal('to-front', 'Front room', 'house-front', [0, 0, 3.85], Math.PI, 1.15),
    ]),
    'house-bedroom': interiorScene('house-bedroom', 'My Home — Bedroom', 'Rest, then log off. This leaves the world.', [
      portal('to-front', 'Front room', 'house-front', [0, 0, 3.85], Math.PI, 1.15),
      portal('logoff', 'Log off', 'logoff', [0, 0, -3.85], 0, 1.15),
    ]),
    'gallery-lobby': interiorScene('gallery-lobby', 'Gallery Pavilion', 'Five wings. Institutions are references, not partners.', [
      portal('to-local', 'Local Culture Wing', 'gallery-local', [-4.35, 0, -1.2], Math.PI / 2, 1.15),
      portal('to-institution', 'Rotating Institutions', 'gallery-institution', [0, 0, -3.85], 0, 1.15),
      portal('to-exchange', '7GC Exchange Wing', 'gallery-exchange', [4.35, 0, -1.2], -Math.PI / 2, 1.15),
      portal('to-public', 'Public Community Gallery', 'gallery-public', [-2.2, 0, 3.85], Math.PI, 1.15),
      portal('to-mine', 'My Gallery', 'gallery-mine', [2.2, 0, 3.85], Math.PI, 1.15),
      portal('to-commons', 'Back to Commons', 'commons', [0, 0, 3.85], Math.PI, 1.2),
    ], 'gallery-wing'),
    'gallery-local': interiorScene('gallery-local', 'Gallery Pavilion — Local Culture', 'Original and public-domain community stories. No scraped museum art.', [
      portal('to-lobby', 'Gallery lobby', 'gallery-lobby', [0, 0, 3.85], Math.PI, 1.15),
    ], 'gallery-wing'),
    'gallery-institution': interiorScene('gallery-institution', 'Gallery Pavilion — Rotating Institutions', 'External institution references. affiliation_claim is false. Media is external-link-only.', [
      portal('to-lobby', 'Gallery lobby', 'gallery-lobby', [0, 0, 3.85], Math.PI, 1.15),
    ], 'gallery-wing'),
    'gallery-exchange': interiorScene('gallery-exchange', 'Gallery Pavilion — 7GC Exchange', 'Cross-campus exchange. Not an institutional endorsement.', [
      portal('to-lobby', 'Gallery lobby', 'gallery-lobby', [0, 0, 3.85], Math.PI, 1.15),
    ], 'gallery-wing'),
    'gallery-public': interiorScene('gallery-public', 'Gallery Pavilion — Public Community', 'Only work that was explicitly published.', [
      portal('to-lobby', 'Gallery lobby', 'gallery-lobby', [0, 0, 3.85], Math.PI, 1.15),
    ], 'gallery-wing'),
    'gallery-mine': interiorScene('gallery-mine', 'Gallery Pavilion — My Gallery', 'Private by default. Publishing is a separate confirmed action.', [
      portal('to-lobby', 'Gallery lobby', 'gallery-lobby', [0, 0, 3.85], Math.PI, 1.15),
    ], 'gallery-wing'),
    'review-house-a': reviewHouse('review-house-a', 'House A review', 'house_a'),
    'review-house-b': reviewHouse('review-house-b', 'House B review', 'house_b'),
    'review-house-c': reviewHouse('review-house-c', 'House C review', 'house_c'),
  };

  for (const campus of CAMPUSES) {
    Object.assign(scenes, campusScenes(campus));
  }
  return scenes;
}

export function transitGate(campusId) {
  const index = CAMPUSES.findIndex((campus) => campus.id === campusId);
  const spread = (index - 3) * 0.42;
  const radius = 8.2;
  const x = Math.sin(spread) * radius;
  const z = -Math.cos(spread) * radius * 0.72 - 1.2;
  return {
    campusId,
    position: [Number(x.toFixed(2)), 0, Number(z.toFixed(2))],
    rotationY: spread,
  };
}

export const SCENES = buildScenes();

export function sceneById(id) {
  return SCENES[id] || null;
}

export function campusById(id) {
  return CAMPUSES.find((campus) => campus.id === id) || null;
}

export const TRANSIT_NAMES = CAMPUSES.map((campus) => campus.displayName);

const STACK = ['exterior', 'lobby', 'lab', 'gallery'];

export function embodiedCampuses() {
  return CAMPUSES.map((campus) => {
    const missing = STACK.filter((part) => !SCENES[`${campus.id}-${part}`]);
    return {
      id: campus.id,
      displayName: campus.displayName,
      catalogSlug: campus.catalogSlug,
      embodied: missing.length === 0,
      missing,
      affiliation_claim: campus.affiliation_claim === true,
      coordinates: campus.coordinates,
      suppress_coordinates: campus.suppress_coordinates === true,
    };
  });
}

export function firstDeliverableIds() {
  return [
    'commons',
    'transit',
    'house-front',
    'house-study',
    'gary-exterior',
    'gary-lobby',
    'gary-gallery',
  ];
}
