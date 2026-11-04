/**
 * Campus interior programs for the walkable world graph.
 *
 * Every `trace` string must appear verbatim in the matching
 * data/campus/v4/<slug>.architecture.json array fields; the acceptance suite
 * enforces this so interiors cannot drift into invented program content.
 * Geometry is a stylized planning-twin layout, never measured floor plans.
 */

export const CAMPUS_INTERIOR_ZONE_KINDS = Object.freeze(['lobby', 'learning', 'research', 'gallery', 'community']);

/** Side-wall slots keep the centre aisle and the portal row (z ≈ -3.7) walkable. */
export const INTERIOR_FIXTURE_SLOTS = Object.freeze([
  [-4.5, -1.2],
  [4.5, -1.2],
  [-4.5, 1.9],
  [4.5, 1.9],
]);

function fixture(label, trace, size, color) {
  return Object.freeze({ label, trace, size, color });
}

export const CAMPUS_INTERIORS = Object.freeze({
  gary: {
    floor: '#57534e',
    wall: '#8b5a2b',
    shell: [
      { kind: 'column', id: 'steel-frame-a', position: [-3, 1.6, -5.2], size: [0.3, 3.2, 0.3], color: '#3f3f46', trace: 'steel-frame / masonry massing' },
      { kind: 'column', id: 'steel-frame-b', position: [3, 1.6, -5.2], size: [0.3, 3.2, 0.3], color: '#3f3f46', trace: 'steel-frame / masonry massing' },
      { kind: 'window', id: 'clerestory', position: [0, 2.9, -5.45], size: [10, 0.5, 0.06], color: '#bfdbfe', trace: 'adaptive-reuse civic/industrial hall' },
    ],
    zones: {
      lobby: [
        fixture('Civic / workforce dashboard wall', 'civic/workforce dashboard wall', [0.3, 2, 1.6], '#0f172a'),
        fixture('Student project wall', 'student project walls / wayfinding', [0.3, 1.8, 1.6], '#a16207'),
        fixture('Project corridor bench', 'project corridor', [1.2, 0.5, 1.6], '#78716c'),
      ],
      learning: [
        fixture('Apprenticeship studio bench', 'apprenticeship studio', [1.4, 0.9, 1.6], '#78716c'),
        fixture('AI / cloud lab-wing desk', 'AI/cloud via lab wing', [1.4, 0.9, 1.4], '#1e293b'),
      ],
      research: [
        fixture('Repair bay workbench', 'repair bay', [1.4, 1, 1.6], '#57534e'),
        fixture('Networking lab rack', 'networking lab', [1, 2, 1], '#0f172a'),
        fixture('Transparent lab bay screen', 'transparent lab bays', [0.2, 2.2, 1.6], '#bae6fd'),
      ],
      gallery: [
        fixture('Showcase gallery plinth', 'showcase gallery', [1, 1.1, 1], '#e7e5e4'),
        fixture('Industrial memory plate', 'industrial memory landscape plate', [1.4, 0.3, 1.4], '#78350f'),
      ],
      community: [
        fixture('Community event hall seating', 'community event hall', [1.4, 0.6, 1.6], '#b45309'),
        fixture('Civic hardscape plaza bench', 'civic hardscape plaza', [1.4, 0.45, 1], '#a8a29e'),
      ],
    },
  },
  ghana: {
    floor: '#8a6a3a',
    wall: '#ca8a04',
    shell: [
      { kind: 'canopy', id: 'deep-overhang', position: [0, 3.3, 0], size: [12.6, 0.18, 12.6], color: '#78350f', trace: 'shade canopy' },
      { kind: 'planting', id: 'courtyard-plate', position: [0, -0.02, 1.2], size: [3.6, 0.06, 3.6], color: '#65a30d', trace: 'courtyard planting plate' },
    ],
    zones: {
      lobby: [
        fixture('Mentor wayfinding board', 'mentor wayfinding', [0.3, 1.8, 1.4], '#fde68a'),
        fixture('Courtyard ring bench', 'courtyard ring', [1.4, 0.5, 1.6], '#92400e'),
      ],
      learning: [
        fixture('Device bar counter', 'device bar', [1.2, 1.05, 1.8], '#a16207'),
        fixture('Mentor workspace table', 'mentor workspace', [1.4, 0.8, 1.4], '#78350f'),
      ],
      research: [
        fixture('Repair / network lab bench', 'repair/network labs', [1.4, 1, 1.6], '#57534e'),
        fixture('Regional pop-up yard crate', 'regional pop-up yard', [1.2, 1.2, 1.2], '#78716c'),
      ],
      gallery: [
        fixture('Hybrid recording studio booth', 'hybrid recording studio', [1.4, 2, 1.4], '#7c2d12'),
      ],
      community: [
        fixture('Event court edge seating', 'event court edge', [1.4, 0.5, 1.8], '#b45309'),
        fixture('Pavilion door facing court', 'pavilion doors facing court', [0.25, 2.2, 1.2], '#92400e'),
      ],
    },
  },
  guyana: {
    floor: '#3f5e3a',
    wall: '#0e7490',
    shell: [
      { kind: 'stair', id: 'raised-spine-deck', position: [0, 0.02, 0], size: [11.4, 0.04, 4], color: '#a16207', trace: 'raised learning spine' },
      { kind: 'canopy', id: 'veranda-shade', position: [0, 2.8, 3.8], size: [11.4, 0.14, 2.4], color: '#155e75', trace: 'shaded veranda' },
    ],
    zones: {
      lobby: [
        fixture('Public resilience dashboard', 'public resilience dashboard', [0.3, 2, 1.6], '#0f172a'),
        fixture('River-facing landscape bench', 'river-facing landscape edge', [1.4, 0.5, 1.6], '#4d7c0f'),
      ],
      learning: [
        fixture('Elevated classroom desk row', 'elevated classroom volumes', [1.4, 0.8, 1.8], '#0e7490'),
        fixture('Bridge connector rail', 'bridge connectors', [0.25, 1.1, 1.8], '#334155'),
      ],
      research: [
        fixture('Climate + GIS studio table', 'climate + GIS studio', [1.4, 0.9, 1.6], '#155e75'),
        fixture('Energy / logistics systems rack', 'energy/logistics studio', [1, 1.8, 1.2], '#164e63'),
        fixture('Hardware / network lab bench', 'hardware/network labs', [1.4, 1, 1.4], '#334155'),
      ],
      gallery: [
        fixture('Flood-literacy demonstration model', 'flood-aware demonstration landscape', [1.4, 0.6, 1.4], '#4d7c0f'),
        fixture('Rain-garden plate', 'rain-garden plate', [1.4, 0.2, 1.4], '#65a30d'),
      ],
      community: [
        fixture('Boardwalk-like link bench', 'boardwalk-like links', [1.4, 0.5, 1.8], '#a16207'),
      ],
    },
  },
  geelong: {
    floor: '#57534e',
    wall: '#9a3412',
    shell: [
      { kind: 'roof', id: 'sawtooth-a', position: [-3.8, 3.4, 0], size: [3.6, 0.5, 11.4], color: '#78716c', trace: 'sawtooth workshop shed' },
      { kind: 'roof', id: 'sawtooth-b', position: [0, 3.6, 0], size: [3.6, 0.5, 11.4], color: '#a8a29e', trace: 'sawtooth workshop shed' },
      { kind: 'roof', id: 'sawtooth-c', position: [3.8, 3.4, 0], size: [3.6, 0.5, 11.4], color: '#78716c', trace: 'sawtooth workshop shed' },
    ],
    zones: {
      lobby: [
        fixture('Prototype wall', 'prototype wall wayfinding', [0.3, 2, 1.8], '#fdba74'),
        fixture('Showcase arrival desk', 'showcase arrival', [1.2, 1, 1.4], '#9a3412'),
      ],
      learning: [
        fixture('Design / build studio table', 'design/build studio', [1.4, 0.9, 1.8], '#a16207'),
        fixture('Studio connector shelving', 'studio connectors', [0.6, 1.8, 1.6], '#57534e'),
      ],
      research: [
        fixture('Manufacturing shed cell', 'manufacturing shed', [1.4, 1.4, 1.6], '#44403c'),
        fixture('Health-tech lab bench', 'health-tech lab', [1.4, 1, 1.4], '#e2e8f0'),
      ],
      gallery: [
        fixture('Industry briefing / showcase board', 'industry briefing/showcase', [0.3, 2, 1.8], '#0f172a'),
        fixture('Gantry reference model (schematic)', 'gantry reference', [1.2, 1.6, 0.6], '#f97316'),
      ],
      community: [
        fixture('Maker / prototype yard bench', 'maker/prototype yard', [1.4, 0.6, 1.8], '#a8a29e'),
        fixture('Clean-energy canopy kiosk', 'clean-energy canopy', [1.2, 1.4, 1.2], '#facc15'),
      ],
    },
  },
  germany: {
    floor: '#44403c',
    wall: '#7f1d1d',
    shell: [
      { kind: 'column', id: 'brick-grid-a', position: [-5.6, 1.6, -2], size: [0.4, 3.2, 0.4], color: '#991b1b', trace: 'brick/steel apprenticeship hall grid' },
      { kind: 'column', id: 'brick-grid-b', position: [5.6, 1.6, -2], size: [0.4, 3.2, 0.4], color: '#991b1b', trace: 'brick/steel apprenticeship hall grid' },
      { kind: 'column', id: 'brick-grid-c', position: [-5.6, 1.6, 2.5], size: [0.4, 3.2, 0.4], color: '#991b1b', trace: 'brick/steel apprenticeship hall grid' },
      { kind: 'column', id: 'brick-grid-d', position: [5.6, 1.6, 2.5], size: [0.4, 3.2, 0.4], color: '#991b1b', trace: 'brick/steel apprenticeship hall grid' },
      { kind: 'roof', id: 'industrial-bay-gantry', position: [0, 3.1, 0], size: [11.4, 0.25, 0.4], color: '#475569', trace: 'tall industrial bay' },
    ],
    zones: {
      lobby: [
        fixture('Apprenticeship path signage', 'apprenticeship path wayfinding', [0.3, 2, 1.4], '#f8fafc'),
        fixture('Worker commons bench', 'worker commons', [1.4, 0.5, 1.8], '#78716c'),
      ],
      learning: [
        fixture('Mechatronics bay trainer', 'mechatronics bay', [1.4, 1.3, 1.6], '#475569'),
        fixture('Grid-aisle workstation', 'disciplined grid aisles', [1.2, 0.9, 1.4], '#57534e'),
      ],
      research: [
        fixture('Industry 4.0 twin lab cell', 'Industry 4.0 twin lab', [1.4, 1.5, 1.6], '#334155'),
        fixture('Cyber / industrial network rack', 'cyber/industrial network lab', [1, 2, 1], '#0f172a'),
      ],
      gallery: [
        fixture('Documentation gallery case', 'documentation gallery', [1, 1.4, 1.6], '#e7e5e4'),
        fixture('Standards gallery shelf', 'standards gallery', [0.5, 2, 1.6], '#cbd5e1'),
      ],
      community: [
        fixture('Logistics / service lane marker', 'logistics/service lane', [1.4, 0.3, 1.8], '#facc15'),
        fixture('Rail-edge arrival board', 'rail-edge arrival', [0.3, 1.8, 1.4], '#1e293b'),
      ],
    },
  },
  gaza: {
    floor: '#78716c',
    wall: '#a8a29e',
    shell: [
      { kind: 'canopy', id: 'solar-canopy', position: [0, 3.2, 0], size: [8, 0.12, 6], color: '#1e3a8a', trace: 'solar canopy' },
      { kind: 'wall', id: 'module-seam', position: [0, 1.6, -5.4], size: [0.12, 3.2, 0.1], color: '#57534e', trace: 'temporary learning module' },
    ],
    zones: {
      lobby: [
        fixture('Safe temporary learning circle', 'safe temporary learning circle', [1.4, 0.45, 1.8], '#a8a29e'),
        fixture('Teacher-support station', 'teacher-support station', [1.2, 1, 1.4], '#57534e'),
      ],
      learning: [
        fixture('Offline learning module shelf', 'offline learning module', [0.8, 1.6, 1.6], '#44403c'),
        fixture('Remote mentor link desk', 'remote mentor link', [1.2, 0.9, 1.4], '#1e293b'),
      ],
      research: [
        fixture('Repair bench', 'repair bench', [1.4, 1, 1.6], '#57534e'),
        fixture('Secure storage module', 'secure storage module', [1.2, 1.6, 1.2], '#3f3f46'),
      ],
      gallery: [
        fixture('Reconstruction documentation studio desk', 'reconstruction documentation studio', [1.4, 1, 1.6], '#78716c'),
      ],
      community: [
        fixture('Psychosocial quiet space screen', 'psychosocial quiet space', [0.3, 1.8, 1.8], '#d6d3d1'),
        fixture('Module network link bench', 'module network links', [1.4, 0.45, 1.4], '#a8a29e'),
      ],
    },
  },
  'graham-land': {
    floor: '#cbd5e1',
    wall: '#64748b',
    shell: [
      { kind: 'roof', id: 'insulated-module-ceiling', position: [0, 3.1, 0], size: [11.4, 0.2, 11.4], color: '#e2e8f0', trace: 'polar research module' },
      { kind: 'fixture', id: 'sensor-overlay', position: [0, 0.01, 1.2], size: [3, 0.02, 3], color: '#38bdf8', trace: 'sensor overlay markers' },
    ],
    zones: {
      lobby: [
        fixture('Truth panel', 'truth panel', [0.3, 2, 1.6], '#f8fafc'),
        fixture('Exhibit arrival case', 'exhibit arrival', [1, 1.2, 1.4], '#94a3b8'),
      ],
      learning: [
        fixture('GIS / remote-sensing studio table', 'GIS/RS studio', [1.4, 0.9, 1.6], '#334155'),
        fixture('Climate data lab desk', 'climate data lab', [1.4, 0.9, 1.4], '#0f172a'),
      ],
      research: [
        fixture('NTN / satcom console', 'NTN/satcom', [1.2, 1.4, 1.4], '#1e293b'),
        fixture('Cyber / research-data rack', 'cyber/research-data lab', [1, 2, 1], '#0f172a'),
        fixture('Antenna / sensor mast model', 'antenna/sensor mast', [0.4, 2.4, 0.4], '#94a3b8'),
      ],
      gallery: [
        fixture('Exhibit studio display', 'exhibit studio', [0.4, 1.8, 1.8], '#e2e8f0'),
        fixture('Simulated ice / terrain model', 'simulated ice/terrain plate', [1.4, 0.4, 1.4], '#f1f5f9'),
      ],
      community: [
        fixture('Cross-campus ops room wall', 'cross-campus ops room', [0.3, 2, 1.8], '#0f172a'),
        fixture('Ops visualization table', 'ops visualization room', [1.4, 0.9, 1.4], '#334155'),
      ],
    },
  },
});

export function campusInteriorFor(campusSlug, zoneKind) {
  const campus = CAMPUS_INTERIORS[campusSlug];
  if (!campus || !CAMPUS_INTERIOR_ZONE_KINDS.includes(zoneKind)) return null;
  const fixtures = (campus.zones[zoneKind] || []).slice(0, INTERIOR_FIXTURE_SLOTS.length).map((item, index) => {
    const [x, z] = INTERIOR_FIXTURE_SLOTS[index];
    return { ...item, position: [x, item.size[1] / 2, z] };
  });
  return { floor: campus.floor, wall: campus.wall, shell: campus.shell, fixtures };
}
