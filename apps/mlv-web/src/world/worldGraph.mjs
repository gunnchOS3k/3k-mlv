/**
 * Authoritative V1 world graph.
 *
 * This module is deliberately plain JavaScript so the browser runtime and the
 * Node acceptance suite validate the exact same graph.  It contains authored
 * scene data only; React rendering and browser side effects live elsewhere.
 */

export const CANONICAL_CAMPUS_SLUGS = Object.freeze([
  'gary',
  'ghana',
  'guyana',
  'geelong',
  'germany',
  'gaza',
  'graham-land',
]);

export const CAMPUS_SPECS = Object.freeze([
  {
    slug: 'gary',
    worldId: 'GARY',
    title: 'Gary',
    identity: 'civic technology and workforce learning campus',
    focus: 'civic resilience, apprenticeship, public dashboards, and device labs',
    accent: '#a16207',
    source: 'docs/campus/7GC_CAMPUS_SOURCE_REQUIREMENTS.md#waike-gary-upnow',
  },
  {
    slug: 'ghana',
    worldId: 'GHANA',
    title: 'Ghana',
    identity: 'shaded courtyard and learning pavilion',
    focus: 'repair, mentoring, community learning, and climate-responsive gathering',
    accent: '#b45309',
    source: 'docs/campus/7GC_CAMPUS_SOURCE_REQUIREMENTS.md#waike-ghana-upnow',
  },
  {
    slug: 'guyana',
    worldId: 'GUYANA',
    title: 'Guyana',
    identity: 'raised climate-resilience learning spine',
    focus: 'climate and GIS data, energy, logistics, and resilient hardware',
    accent: '#0e7490',
    source: 'docs/campus/7GC_CAMPUS_SOURCE_REQUIREMENTS.md#waike-guyana-upnow',
  },
  {
    slug: 'geelong',
    worldId: 'GEELONG',
    title: 'Geelong',
    identity: 'workshop and maker-yard campus',
    focus: 'design-build, robotics, clean energy, and health technology',
    accent: '#9a3412',
    source: 'docs/campus/7GC_CAMPUS_SOURCE_REQUIREMENTS.md#waike-geelong-upnow',
  },
  {
    slug: 'germany',
    worldId: 'GERMANY',
    title: 'Ruhr',
    identity: 'apprenticeship and Industry 4.0 learning hall',
    focus: 'industrial digital twins, standards, cyber, and logistics',
    accent: '#475569',
    source: 'docs/campus/7GC_CAMPUS_SOURCE_REQUIREMENTS.md#waike-germany-upnow',
  },
  {
    slug: 'gaza',
    worldId: 'GAZA',
    title: 'Gaza',
    identity: 'distributed recovery-learning network',
    focus: 'offline learning, repair, solar power, secure storage, and reconstruction documentation',
    accent: '#78716c',
    source: 'docs/campus/7GC_CAMPUS_SOURCE_REQUIREMENTS.md#waike-gaza-upnow',
    truthNote: 'Distributed proposal only; no permanent-campus claim and no precise or sensitive coordinates.',
  },
  {
    slug: 'graham-land',
    worldId: 'GRAHAM_LAND',
    title: 'Graham Land',
    identity: 'remote polar research-education twin',
    focus: 'climate data, GIS, sensors, NTN communications, cyber, and field safety',
    accent: '#64748b',
    source: 'docs/campus/7GC_CAMPUS_SOURCE_REQUIREMENTS.md#waike-graham-land-upnow',
    truthNote: 'Remote simulation and partner-reference surface; no WAIKE-owned or gunnchOS Antarctic facility claim.',
  },
]);

export const CAMPUS_ALIASES = Object.freeze({
  ruhr: 'germany',
  germany: 'germany',
});

export function canonicalCampusSlug(value) {
  const slug = String(value || '').trim().toLowerCase();
  if (slug === 'ruhr') return 'germany';
  return CANONICAL_CAMPUS_SLUGS.includes(slug) ? slug : null;
}

const CORE_SCENES = [
  { id: 'commons', worldId: 'COMMONS', kind: 'commons', title: '3k MLV Commons', identity: 'walkable neighborhood commons', accent: '#3f6212', description: 'A shared neighborhood with My Home, the Gallery Pavilion, and Campus Transit.' },
  { id: 'transit', worldId: 'TRANSIT', kind: 'transit', title: 'Campus Transit', identity: 'seven-destination travel hall', accent: '#0369a1', description: 'An accessible travel concourse for all seven campus planning twins.' },
  { id: 'home-yard', worldId: 'HOME', kind: 'home-yard', title: 'My Home — Yard', identity: 'private residence threshold', accent: '#4d7c0f', description: 'A porch, garden path, mailbox, and explicit private-home threshold.' },
  { id: 'home-living', worldId: 'HOME', kind: 'home-room', title: 'My Home — Living Room', identity: 'home orientation and shared living', accent: '#92400e', description: 'A warm front room connecting every functional Home space.' },
  { id: 'home-media', worldId: 'HOME', kind: 'home-room', title: 'My Home — Media Room', identity: 'rights-aware first-party media dock', accent: '#7c3aed', description: 'A private media dock for first-party experiences and user-owned media.' },
  { id: 'home-office', worldId: 'HOME', kind: 'home-room', title: 'My Home — Office / Workbench', identity: 'private work and file surface', accent: '#0f766e', description: 'A private-by-default workbench for files, drafts, and explicit sharing.' },
  { id: 'home-bedroom', worldId: 'HOME', kind: 'home-room', title: 'My Home — Bedroom', identity: 'rest and authenticated exit', accent: '#4338ca', description: 'A quiet private room with the real account logoff action.' },
  { id: 'gallery-lobby', worldId: 'GALLERY', kind: 'gallery-lobby', title: 'Gallery Pavilion — Lobby', identity: 'five-wing cultural and community gallery', accent: '#7c2d12', description: 'The orientation lobby for five distinct rights-aware gallery wings.' },
  { id: 'gallery-local', worldId: 'GALLERY', kind: 'gallery-wing', title: 'Gallery — Local Culture', identity: 'community-authored local culture', accent: '#b45309', description: 'Original and public-domain community stories; no scraped institution media.' },
  { id: 'gallery-institution', worldId: 'GALLERY', kind: 'gallery-wing', title: 'Gallery — Rotating Institution', identity: 'source-backed metadata rotation', accent: '#57534e', description: 'Metadata-only external references with affiliation_claim=false.' },
  { id: 'gallery-exchange', worldId: 'GALLERY', kind: 'gallery-wing', title: 'Gallery — 7GC Exchange', identity: 'explicit cross-campus showcase', accent: '#1d4ed8', description: 'Explicitly published work shared across the seven campus communities.' },
  { id: 'gallery-public', worldId: 'GALLERY', kind: 'gallery-wing', title: 'Gallery — Public Community', identity: 'confirmed public discovery', accent: '#ca8a04', description: 'Only assets whose owners explicitly confirmed public publishing.' },
  { id: 'gallery-mine', worldId: 'GALLERY', kind: 'gallery-wing', title: 'Gallery — My Gallery', identity: 'owner-private gallery workspace', accent: '#1e3a8a', description: 'Private working copies and drafts; publishing is always a separate confirmation.' },
];

const CAMPUS_SCENE_KINDS = Object.freeze(['arrival', 'lobby', 'learning', 'research', 'gallery', 'community']);
const CAMPUS_ZONE_COPY = Object.freeze({
  arrival: ['Arrival / Exterior', 'truthful planning-twin threshold'],
  lobby: ['Civic Hall / Orientation', 'local context, provenance, and accessible wayfinding'],
  learning: ['Learning Studio', 'WAIKE source-of-record learning handoff'],
  research: ['Project / Research Lab', 'simulation and prototype research handoff'],
  gallery: ['Culture / Archive', 'source-backed local and partner-reference material'],
  community: ['Showcase / Community', 'explicitly public campus showcase and gathering'],
});

const CAMPUS_SCENES = CAMPUS_SPECS.flatMap((campus) =>
  CAMPUS_SCENE_KINDS.map((sceneKind) => {
    const [zoneTitle, purpose] = CAMPUS_ZONE_COPY[sceneKind];
    return {
      id: `${campus.slug}-${sceneKind}`,
      worldId: campus.worldId,
      kind: `campus-${sceneKind}`,
      campusSlug: campus.slug,
      title: `${campus.title} — ${zoneTitle}`,
      identity: `${campus.identity}; ${purpose}`,
      accent: campus.accent,
      description: `${campus.focus}. ${campus.truthNote || 'Authored proposal/digital twin; not evidence of deployed physical infrastructure.'}`,
      source: campus.source,
    };
  }),
);

const SCENE_SPECS = [...CORE_SCENES, ...CAMPUS_SCENES];

const EDGES = [
  ['commons', 'home-yard', 'Enter My Home', 'Return to Commons'],
  ['commons', 'gallery-lobby', 'Enter Gallery Pavilion', 'Return to Commons'],
  ['commons', 'transit', 'Enter Campus Transit', 'Return to Commons'],
  ['home-yard', 'home-living', 'Enter the Living Room', 'Step into the Yard'],
  ['home-living', 'home-media', 'Enter Media Room', 'Return to Living Room'],
  ['home-living', 'home-office', 'Enter Office / Workbench', 'Return to Living Room'],
  ['home-living', 'home-bedroom', 'Enter Bedroom', 'Return to Living Room'],
  ['gallery-lobby', 'gallery-local', 'Enter Local Culture', 'Return to Gallery Lobby'],
  ['gallery-lobby', 'gallery-institution', 'Enter Rotating Institution', 'Return to Gallery Lobby'],
  ['gallery-lobby', 'gallery-exchange', 'Enter 7GC Exchange', 'Return to Gallery Lobby'],
  ['gallery-lobby', 'gallery-public', 'Enter Public Community', 'Return to Gallery Lobby'],
  ['gallery-lobby', 'gallery-mine', 'Enter My Gallery', 'Return to Gallery Lobby'],
  ...CAMPUS_SPECS.flatMap((campus) => {
    const arrival = `${campus.slug}-arrival`;
    const lobby = `${campus.slug}-lobby`;
    return [
      ['transit', arrival, `Travel to ${campus.title}`, 'Return to Campus Transit'],
      [arrival, lobby, `Enter ${campus.title} orientation`, 'Return to arrival'],
      [lobby, `${campus.slug}-learning`, 'Enter Learning Studio', 'Return to orientation'],
      [lobby, `${campus.slug}-research`, 'Enter Research Lab', 'Return to orientation'],
      [lobby, `${campus.slug}-gallery`, 'Enter Culture / Archive', 'Return to orientation'],
      [lobby, `${campus.slug}-community`, 'Enter Community Showcase', 'Return to orientation'],
    ];
  }),
];

function safeId(value) {
  return value.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
}

function portalPosition(index, count) {
  const columns = [-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2];
  if (count <= columns.length) return [columns[index + Math.floor((columns.length - count) / 2)], 0, -3.7];
  const row = Math.floor(index / columns.length);
  return [columns[index % columns.length], 0, -3.7 + row * 1.3];
}

function portalsFor(sceneId) {
  const related = EDGES.filter(([from, to]) => from === sceneId || to === sceneId);
  return related.map(([from, to, forward, reverse], index) => {
    const outbound = from === sceneId;
    const target = outbound ? to : from;
    return {
      id: `portal-${safeId(sceneId)}-to-${safeId(target)}`,
      from: sceneId,
      to: target,
      reciprocalId: `portal-${safeId(target)}-to-${safeId(sceneId)}`,
      label: outbound ? forward : reverse,
      position: portalPosition(index, related.length),
      accessPolicy: sceneId.startsWith('home-') ? 'PRIVATE' : 'PUBLIC',
      worldReturnAnchor: `${sceneId}:${target}`,
    };
  });
}

function authoredProps(spec) {
  const outdoor = ['commons', 'transit', 'home-yard', 'campus-arrival'].includes(spec.kind);
  const slugSeed = [...spec.id].reduce((total, char) => total + char.charCodeAt(0), 0);
  const offset = ((slugSeed % 5) - 2) * 0.35;
  if (outdoor) {
    return [
      { id: `${spec.id}-ground`, kind: 'ground', position: [0, -0.08, 0], size: [18, 0.16, 18], color: spec.kind === 'transit' ? '#334155' : '#4d7c0f', roughness: 1 },
      { id: `${spec.id}-landmark`, kind: 'landmark', position: [offset, 1.5, -2], size: [4.5, 3, 2.2], color: spec.accent, roughness: 0.72 },
      { id: `${spec.id}-canopy`, kind: 'canopy', position: [-4.8, 2.2, 1], size: [3.2, 0.22, 4], color: '#d6d3d1', roughness: 0.8 },
      { id: `${spec.id}-sign`, kind: 'wayfinding', position: [4.5, 1.25, 2.2], size: [2.5, 1.4, 0.18], color: '#f8fafc', emissive: spec.accent },
      { id: `${spec.id}-plant-a`, kind: 'planting', shape: 'cylinder', position: [-6, 0.7, -4], size: [1.1, 1.4, 1.1], color: '#166534' },
      { id: `${spec.id}-plant-b`, kind: 'planting', shape: 'cylinder', position: [6, 0.7, -4], size: [1.1, 1.4, 1.1], color: '#166534' },
    ];
  }
  return [
    { id: `${spec.id}-floor`, kind: 'ground', position: [0, -0.08, 0], size: [12, 0.16, 12], color: '#57534e', roughness: 0.92 },
    { id: `${spec.id}-back-wall`, kind: 'wall', position: [0, 1.6, -5.6], size: [12, 3.2, 0.24], color: spec.accent, roughness: 0.85 },
    { id: `${spec.id}-left-wall`, kind: 'wall', position: [-5.9, 1.6, 0], size: [0.24, 3.2, 11.4], color: '#a8a29e', roughness: 0.9 },
    { id: `${spec.id}-right-wall`, kind: 'wall', position: [5.9, 1.6, 0], size: [0.24, 3.2, 11.4], color: '#a8a29e', roughness: 0.9 },
    { id: `${spec.id}-feature`, kind: spec.kind === 'gallery-wing' ? 'art' : 'furniture', position: [offset, 0.75, -1.3], size: [3.4, 1.5, 1], color: spec.accent, roughness: 0.55 },
    { id: `${spec.id}-console`, kind: 'fixture', position: [3.7, 0.8, -3.7], size: [1.4, 1.6, 0.7], color: '#0f172a', emissive: spec.accent },
    { id: `${spec.id}-sign`, kind: 'wayfinding', position: [-3.7, 1.35, -5.4], size: [2.4, 0.8, 0.08], color: '#f8fafc', emissive: spec.accent },
  ];
}

function collisionsFor(spec) {
  if (['commons', 'transit', 'home-yard', 'campus-arrival'].includes(spec.kind)) {
    return [
      { id: `${spec.id}-landmark-collision`, min: [-2.3, 0, -3.2], max: [2.3, 3.2, -0.8] },
      { id: `${spec.id}-canopy-collision`, min: [-6.5, 0, -1], max: [-3.2, 2.5, 3] },
    ];
  }
  return [
    { id: `${spec.id}-back-collision`, min: [-6, 0, -5.8], max: [6, 3.2, -5.4] },
    { id: `${spec.id}-left-collision`, min: [-6.1, 0, -5.8], max: [-5.7, 3.2, 5.8] },
    { id: `${spec.id}-right-collision`, min: [5.7, 0, -5.8], max: [6.1, 3.2, 5.8] },
  ];
}

function sceneActions(spec) {
  const actions = [];
  if (spec.id === 'home-media') {
    actions.push({
      id: 'home-media-first-party-dock', verb: 'LAUNCH', capability: 'APP_LAUNCH',
      destination: 'com.gunnchos.animeaggressors', accessPolicy: 'PRIVATE',
      worldReturnAnchor: 'HOME_MEDIA_DOCK', loadingPolicy: 'EXTERNAL_APP',
      accessibilityAlternative: 'Launch Anime Aggressors and preserve this Media Room return point',
      position: [0, 0, -1.3], label: 'First-party media dock',
    });
  }
  if (spec.id === 'home-office') {
    actions.push({
      id: 'home-private-workbench', verb: 'OPEN', capability: 'PRIVATE_FILE',
      destination: 'home-private-workspace', accessPolicy: 'PRIVATE',
      worldReturnAnchor: 'HOME_OFFICE_WORKBENCH', loadingPolicy: 'PANEL',
      accessibilityAlternative: 'Open the owner-private file workspace',
      position: [0, 0, -1.3], label: 'Private file workbench',
    });
  }
  if (spec.id === 'home-bedroom') {
    actions.push({
      id: 'home-bedroom-logoff', verb: 'LOG OFF', capability: 'LOGOFF',
      accessPolicy: 'PRIVATE', worldReturnAnchor: 'HOME_BEDROOM_EXIT', loadingPolicy: 'INLINE',
      accessibilityAlternative: 'Sign out of the authenticated MLV session',
      position: [0, 0, -1.3], label: 'Log off',
    });
  }
  if (spec.id === 'gallery-local' || spec.id === 'gallery-institution') {
    actions.push({
      id: `${spec.id}-collection`, verb: 'OPEN', capability: 'GALLERY_EXHIBIT',
      destination: '#wing-' + (spec.id === 'gallery-local' ? 'local' : 'rotating'), accessPolicy: 'PUBLIC',
      worldReturnAnchor: spec.id.toUpperCase().replace(/-/g, '_'), loadingPolicy: 'PANEL',
      accessibilityAlternative: `Open the ${spec.title} source-backed exhibit panel`,
      position: [0, 0, -1.3], label: spec.title,
    });
  }
  if (spec.id === 'gallery-exchange' || spec.id === 'gallery-public') {
    actions.push({
      id: `${spec.id}-published`, verb: 'OPEN', capability: 'PUBLIC_FILE',
      destination: spec.id, accessPolicy: 'PUBLIC', worldReturnAnchor: spec.id.toUpperCase().replace(/-/g, '_'),
      loadingPolicy: 'PANEL', accessibilityAlternative: 'Open explicitly published public gallery assets',
      position: [0, 0, -1.3], label: spec.title,
    });
  }
  if (spec.id === 'gallery-mine') {
    actions.push({
      id: 'gallery-mine-private', verb: 'OPEN', capability: 'PRIVATE_FILE',
      destination: 'my-gallery', accessPolicy: 'PRIVATE', worldReturnAnchor: 'GALLERY_MINE',
      loadingPolicy: 'PANEL', accessibilityAlternative: 'Open private My Gallery files',
      position: [0, 0, -1.3], label: 'My private gallery',
    });
  }
  if (spec.kind === 'campus-learning') {
    actions.push({
      id: `${spec.campusSlug}-waike`, verb: 'CONTINUE LEARNING', capability: 'WAIKE_LEARNER',
      destination: `waike://courses?campus=${encodeURIComponent(spec.campusSlug)}`, accessPolicy: 'AUTHENTICATED',
      worldReturnAnchor: `${spec.campusSlug.toUpperCase()}_LEARNING`, loadingPolicy: 'EXTERNAL_APP',
      accessibilityAlternative: `Open the WAIKE source-of-record course surface for ${spec.title.split(' — ')[0]}`,
      position: [0, 0, -1.3], label: 'WAIKE learning console',
    });
  }
  if (spec.kind === 'campus-research') {
    actions.push(
      {
        id: `${spec.campusSlug}-research`, verb: 'OPEN RESEARCH', capability: 'RESEARCH_HANDOFF',
        destination: `research://project/7gc-${spec.campusSlug}-digital-twin`, accessPolicy: 'PUBLIC',
        worldReturnAnchor: `${spec.campusSlug.toUpperCase()}_RESEARCH`, loadingPolicy: 'EXTERNAL_APP',
        accessibilityAlternative: `Open the research portal prototype record for ${spec.title.split(' — ')[0]}`,
        position: [-1.2, 0, -1.3], label: 'Research project console',
      },
      {
        id: `${spec.campusSlug}-network-twin`, verb: 'INSPECT SIMULATION', capability: 'NETWORK_TWIN',
        destination: `#/mlv/campus/${spec.campusSlug}/network-twin`, accessPolicy: 'AUTHENTICATED',
        worldReturnAnchor: `${spec.campusSlug.toUpperCase()}_RESEARCH`, loadingPolicy: 'PANEL',
        accessibilityAlternative: 'Open the labeled planning simulation and Network Twin surface',
        position: [1.2, 0, -1.3], label: 'Network Twin simulation',
      },
    );
  }
  if (spec.kind === 'campus-gallery' || spec.kind === 'campus-community') {
    actions.push({
      id: `${spec.id}-public-surface`, verb: 'OPEN', capability: 'GALLERY_EXHIBIT',
      destination: spec.kind === 'campus-gallery' ? '#wing-local' : '#wing-exchange', accessPolicy: 'PUBLIC',
      worldReturnAnchor: spec.id.toUpperCase().replace(/-/g, '_'), loadingPolicy: 'PANEL',
      accessibilityAlternative: 'Open the source-backed public culture or community showcase surface',
      position: [0, 0, -1.3], label: spec.title,
    });
  }
  return actions;
}

function truthFor(spec) {
  const gaza = spec.campusSlug === 'gaza';
  const graham = spec.campusSlug === 'graham-land';
  return {
    affiliationClaim: false,
    coordinates: null,
    authoredPlanningTwin: true,
    stylizedNotSurveyed: true,
    ...(gaza ? { suppressSensitiveCoordinates: true, noPermanentCampusClaim: true } : {}),
    ...(graham ? { noWaikeOwnedStationClaim: true, externalReferencesRemainExternal: true } : {}),
    note: spec.description,
  };
}

function buildScene(spec) {
  const portals = portalsFor(spec.id);
  const portalActions = portals.map((portal) => ({
    id: portal.id,
    verb: portal.label.toLowerCase().startsWith('return') ? 'RETURN' : 'ENTER',
    capability: 'ROOM_TRANSITION',
    destination: portal.to,
    targetScene: portal.to,
    accessPolicy: portal.accessPolicy,
    worldReturnAnchor: portal.worldReturnAnchor,
    loadingPolicy: 'INLINE',
    accessibilityAlternative: portal.label,
    position: portal.position,
    label: portal.label,
  }));
  return {
    id: spec.worldId,
    sceneId: spec.id,
    sceneKind: spec.kind,
    title: spec.title,
    identity: spec.identity,
    spawn: [0, 0, 5],
    props: authoredProps(spec),
    collisions: collisionsFor(spec),
    interactables: [...portalActions, ...sceneActions(spec)],
    portals,
    rooms: portals.map((portal) => portal.to),
    truth: truthFor(spec),
    ...(spec.campusSlug ? { campusSlug: spec.campusSlug } : {}),
    provenance: [spec.source || 'docs/architecture/WORLD_WORKSPACE_ARCHITECTURE.md'],
  };
}

export const WORLD_GRAPH = Object.freeze(Object.fromEntries(
  SCENE_SPECS.map((spec) => [spec.id, buildScene(spec)]),
));

export const WORLD_ENTRY_SCENES = Object.freeze({
  COMMONS: 'commons',
  HOME: 'home-yard',
  TRANSIT: 'transit',
  GALLERY: 'gallery-lobby',
  GARY: 'gary-arrival',
  GHANA: 'ghana-arrival',
  GUYANA: 'guyana-arrival',
  GEELONG: 'geelong-arrival',
  GERMANY: 'germany-arrival',
  GAZA: 'gaza-arrival',
  GRAHAM_LAND: 'graham-land-arrival',
});

export const V1_REQUIRED_SCENE_IDS = Object.freeze(SCENE_SPECS.map((scene) => scene.id));

export function reachableSceneIds(start = 'commons', graph = WORLD_GRAPH) {
  if (!graph[start]) return [];
  const visited = new Set([start]);
  const queue = [start];
  while (queue.length) {
    const current = queue.shift();
    for (const portal of graph[current].portals || []) {
      if (!visited.has(portal.to) && graph[portal.to]) {
        visited.add(portal.to);
        queue.push(portal.to);
      }
    }
  }
  return [...visited];
}

export function validateWorldGraph(graph = WORLD_GRAPH) {
  const errors = [];
  const sceneIds = Object.keys(graph);
  const required = new Set(V1_REQUIRED_SCENE_IDS);
  for (const id of required) {
    if (!graph[id]) errors.push(`missing required scene: ${id}`);
  }
  for (const id of sceneIds) {
    const scene = graph[id];
    if (scene.sceneId !== id) errors.push(`scene key/id mismatch: ${id}`);
    if (!scene.props?.length) errors.push(`scene has no authored props: ${id}`);
    if (!scene.collisions?.length) errors.push(`scene has no collision: ${id}`);
    if (!scene.interactables?.length) errors.push(`scene has no interaction: ${id}`);
    if (scene.truth?.affiliationClaim !== false) errors.push(`affiliation must remain false: ${id}`);
    if (scene.truth?.coordinates !== null) errors.push(`coordinates must remain unset: ${id}`);
    const ids = new Set();
    for (const item of scene.interactables || []) {
      if (ids.has(item.id)) errors.push(`duplicate interaction id in ${id}: ${item.id}`);
      ids.add(item.id);
      if (item.targetScene && !graph[item.targetScene]) errors.push(`dead interaction target: ${id} -> ${item.targetScene}`);
    }
    for (const portal of scene.portals || []) {
      if (!graph[portal.to]) {
        errors.push(`dead portal target: ${id} -> ${portal.to}`);
        continue;
      }
      const reverse = graph[portal.to].portals?.find((candidate) => candidate.id === portal.reciprocalId);
      if (!reverse || reverse.to !== id || reverse.reciprocalId !== portal.id) {
        errors.push(`non-reciprocal portal: ${portal.id}`);
      }
    }
  }
  const reachable = new Set(reachableSceneIds('commons', graph));
  for (const id of required) {
    if (!reachable.has(id)) errors.push(`unreachable from commons: ${id}`);
  }
  for (const campus of CAMPUS_SPECS) {
    for (const kind of CAMPUS_SCENE_KINDS) {
      if (!graph[`${campus.slug}-${kind}`]) errors.push(`campus zone missing: ${campus.slug}-${kind}`);
    }
  }
  if (canonicalCampusSlug('ruhr') !== 'germany') errors.push('Ruhr alias does not resolve to Germany');
  if (graph['gaza-arrival']?.truth?.suppressSensitiveCoordinates !== true) errors.push('Gaza coordinate suppression missing');
  if (graph['graham-land-arrival']?.truth?.noWaikeOwnedStationClaim !== true) errors.push('Graham Land ownership truth missing');
  for (const scene of Object.values(graph)) {
    if ('visualGoldSlice' in scene || 'structuralComplete' in scene) errors.push(`obsolete completion proxy present: ${scene.sceneId}`);
  }
  return { ok: errors.length === 0, errors, sceneCount: sceneIds.length, reachableCount: reachable.size };
}

export function assertWorldGraph(graph = WORLD_GRAPH) {
  const result = validateWorldGraph(graph);
  if (!result.ok) throw new Error(`Invalid V1 world graph:\n${result.errors.join('\n')}`);
  return result;
}

