import type { CampusSceneDefinition, ModulePlacement, PhaseTier, ProgramZoneDef } from './types';

function mods(...items: ModulePlacement[]): ModulePlacement[] {
  return items;
}

function zones(...items: ProgramZoneDef[]): ProgramZoneDef[] {
  return items;
}

/** Gary — long civic-industrial hall + taller gallery + lab bays + plaza. */
export const GARY_SCENE: CampusSceneDefinition = {
  slug: 'gary',
  silhouette: 'long civic-industrial hall + taller project/gallery volume + visible lab bays',
  sitePlan: 'arrival plaza → project corridor spine → adaptive-reuse hall with lab wing',
  background: '#87a0b8',
  groundColor: '#3d4a3a',
  modules: mods(
    { kind: 'terrain', id: 'gary-terrain', position: [0, 0, 0], size: [22, 0.06, 16], color: '#3d4a3a' },
    { kind: 'plaza', id: 'gary-plaza', position: [0, 0, 7.2], size: [8, 0.1, 4], fromPhase: 'pilot', trace: 'public plaza / arrival court' },
    { kind: 'street', id: 'gary-street', position: [0, 0, 5.2], size: [16, 0.08, 1.2], fromPhase: 'pilot', trace: 'project corridor' },
    { kind: 'learning_hall', id: 'gary-hall', position: [0, 0, 0], size: [12, 2.2, 4.2], color: '#8b5a2b', fromPhase: 'pilot', trace: 'adaptive-reuse civic/industrial hall' },
    { kind: 'arcade', id: 'gary-arcade', position: [0, 0, 2.4], size: [10, 1.6, 1.2], fromPhase: 'semi', trace: 'central public project corridor' },
    { kind: 'gallery_hall', id: 'gary-gallery', position: [5.5, 0, -1.5], size: [3.2, 3.4, 3.5], color: '#6b7280', fromPhase: 'semi', trace: 'taller project/gallery volume' },
    { kind: 'repair_bay', id: 'gary-repair', position: [-5.2, 0, -0.5], size: [3.2, 1.8, 3], fromPhase: 'semi', trace: 'transparent/visible repair labs' },
    { kind: 'lab_block', id: 'gary-cyber', position: [-5.2, 0, 2.2], size: [3, 1.6, 2.2], color: '#57534e', accent: '#38bdf8', fromPhase: 'semi', trace: 'networking labs' },
    { kind: 'community_hall', id: 'gary-community', position: [4.8, 0, 3.5], size: [3.5, 2, 3], color: '#b45309', fromPhase: 'full', trace: 'community event hall' },
    { kind: 'lab_block', id: 'gary-apprentice', position: [-2, 0, -3.5], size: [5, 1.8, 2.8], color: '#78716c', fromPhase: 'full', trace: 'apprenticeship/project studio' },
    { kind: 'wayfinding', id: 'gary-way', position: [-3, 0, 6.5], size: [0.2, 1.4, 0.2], label: 'Build→Ship', fromPhase: 'pilot' },
  ),
  programZones: zones(
    { id: 'gz1', buildingId: 'gary-hall', wingId: 'main', programKey: 'FLEXIBLE_CLASSROOM', name: 'Classroom', position: [-3, 0.05, 0.2], fromPhase: 'pilot' },
    { id: 'gz2', buildingId: 'gary-hall', wingId: 'main', programKey: 'DEVICE_HELP_DESK_TABLE', name: 'Device desk', position: [0, 0.05, 0.8], fromPhase: 'pilot' },
    { id: 'gz3', buildingId: 'gary-repair', wingId: 'labs', programKey: 'HARDWARE_REPAIR_LAB', name: 'Repair', position: [-5.2, 0.05, -0.5], fromPhase: 'semi' },
    { id: 'gz4', buildingId: 'gary-gallery', wingId: 'gallery', programKey: 'SHOWCASE_DEMO_GALLERY', name: 'Gallery', position: [5.5, 0.05, -1.5], fromPhase: 'semi' },
    { id: 'gz5', buildingId: 'gary-community', wingId: 'civic', programKey: 'COMMUNITY_EVENT_SPACE', name: 'Community', position: [4.8, 0.05, 3.5], fromPhase: 'full' },
  ),
  phaseMassing: {
    pilot: {
      scale: [0.85, 0.75, 0.85],
      extraModules: [
        { kind: 'temporary_module', id: 'gary-cart-a', position: [-2.5, 0, 4], size: [1.4, 0.9, 1.1], color: '#a16207', fromPhase: 'pilot', trace: 'mobile hardware cart' },
        { kind: 'temporary_module', id: 'gary-cart-b', position: [2.5, 0, 4], size: [1.4, 0.9, 1.1], color: '#57534e', fromPhase: 'pilot', trace: 'mobile networking cart' },
      ],
    },
    semi: { scale: [0.95, 0.95, 0.95] },
    full: { scale: [1.05, 1.1, 1.05] },
  },
};

/** Ghana — low pavilion cluster + strong central courtyard + shade canopies. */
export const GHANA_SCENE: CampusSceneDefinition = {
  slug: 'ghana',
  silhouette: 'low pavilion cluster + strong central courtyard + shade canopies',
  sitePlan: 'ring of learning pavilions around shaded civic courtyard with device bar',
  background: '#c4b07a',
  groundColor: '#8a6a3a',
  modules: mods(
    { kind: 'terrain', id: 'gh-terrain', position: [0, 0, 0], size: [20, 0.06, 18], color: '#8a6a3a' },
    { kind: 'courtyard', id: 'gh-court', position: [0, 0, 0], size: [7, 0.1, 7], color: '#84cc16', fromPhase: 'pilot', trace: 'shaded civic courtyard' },
    { kind: 'solar_canopy', id: 'gh-shade', position: [0, 0, 0], size: [8, 2.4, 8], fromPhase: 'pilot', trace: 'deep overhangs / shade canopies' },
    { kind: 'learning_hall', id: 'gh-pav-n', position: [0, 0, -5.5], size: [5, 1.5, 2.8], color: '#ca8a04', fromPhase: 'pilot', trace: 'learning pavilion' },
    { kind: 'learning_hall', id: 'gh-pav-e', position: [5.5, 0, 0], size: [2.8, 1.5, 5], color: '#d97706', fromPhase: 'pilot', trace: 'learning pavilion' },
    { kind: 'learning_hall', id: 'gh-pav-w', position: [-5.5, 0, 0], size: [2.8, 1.5, 5], color: '#b45309', fromPhase: 'semi', trace: 'repair/network lab blocks' },
    { kind: 'covered_walk', id: 'gh-breeze', position: [0, 0, 3.8], size: [6, 2, 1.4], fromPhase: 'pilot', trace: 'covered breezeways' },
    { kind: 'lab_block', id: 'gh-device', position: [0, 0, 5.2], size: [4.5, 1.3, 2], color: '#a16207', accent: '#fde68a', fromPhase: 'semi', trace: 'device bar facing courtyard' },
    { kind: 'community_hall', id: 'gh-community', position: [4.5, 0, 5], size: [3.2, 1.8, 3], color: '#92400e', fromPhase: 'semi', trace: 'community room opening to event court' },
    { kind: 'media_studio', id: 'gh-media', position: [-4.5, 0, 5], size: [2.8, 1.6, 2.5], fromPhase: 'semi', trace: 'hybrid recording studio' },
    { kind: 'workshop_shed', id: 'gh-popup', position: [0, 0, -8.2], size: [6, 1.8, 2.5], color: '#78716c', fromPhase: 'full', trace: 'regional pop-up lab storage/deployment yard' },
    { kind: 'lab_block', id: 'gh-mentor', position: [7.5, 0, -4], size: [2.5, 1.5, 3], color: '#78350f', fromPhase: 'full', trace: 'mentor / visiting instructor workspace' },
    { kind: 'wayfinding', id: 'gh-way', position: [2.5, 0, 2.5], size: [0.2, 1.2, 0.2], label: 'Courtyard', fromPhase: 'pilot' },
  ),
  programZones: zones(
    { id: 'gh1', buildingId: 'gh-pav-n', wingId: 'north', programKey: 'FLEXIBLE_CLASSROOM', name: 'Classroom', position: [0, 0.05, -5.5], fromPhase: 'pilot' },
    { id: 'gh2', buildingId: 'gh-device', wingId: 'court', programKey: 'DEVICE_BAR', name: 'Device bar', position: [0, 0.05, 5.2], fromPhase: 'semi' },
    { id: 'gh3', buildingId: 'gh-mentor', wingId: 'east', programKey: 'MENTOR_WORKSPACE', name: 'Mentor', position: [7.5, 0.05, -4], fromPhase: 'full' },
  ),
  phaseMassing: {
    pilot: { scale: [0.8, 0.7, 0.8] },
    semi: { scale: [0.95, 0.9, 0.95] },
    full: { scale: [1.08, 1, 1.08] },
  },
};

/** Guyana — long raised spine + bridges + climate tower + water edge. */
export const GUYANA_SCENE: CampusSceneDefinition = {
  slug: 'guyana',
  silhouette: 'long raised spine + bridge connectors + climate-data tower/studio + water edge',
  sitePlan: 'river edge → elevated linear learning spine with bridge connectors and flood landscape',
  background: '#6b9bb8',
  groundColor: '#3f5e3a',
  modules: mods(
    { kind: 'terrain', id: 'gy-terrain', position: [0, 0, 0], size: [24, 0.06, 14], color: '#3f5e3a' },
    { kind: 'water', id: 'gy-water', position: [0, 0, 5.5], size: [22, 0.1, 3.5], fromPhase: 'pilot', trace: 'water/rain-garden edge' },
    { kind: 'landscape', id: 'gy-flood', position: [0, 0, 3.2], size: [18, 0.12, 1.5], color: '#4d7c0f', fromPhase: 'pilot', trace: 'flood-aware landscape demonstration' },
    { kind: 'raised_walk', id: 'gy-spine', position: [0, 0, 0], size: [16, 1.2, 2.2], fromPhase: 'pilot', trace: 'raised linear learning spine' },
    { kind: 'learning_hall', id: 'gy-hall-a', position: [-5, 1.2, 0], size: [4, 1.8, 3.2], color: '#0e7490', fromPhase: 'pilot', trace: 'elevated classroom volume' },
    { kind: 'bridge', id: 'gy-bridge-a', position: [-2, 0, 0], size: [2.5, 1.2, 1.2], fromPhase: 'semi', trace: 'bridge connectors' },
    { kind: 'lab_block', id: 'gy-climate', position: [1.5, 1.2, 0], size: [3.2, 3.2, 3.2], color: '#155e75', accent: '#67e8f9', fromPhase: 'semi', trace: 'climate + GIS studio signature volume' },
    { kind: 'bridge', id: 'gy-bridge-b', position: [4.5, 0, 0], size: [2.5, 1.2, 1.2], fromPhase: 'semi', trace: 'boardwalk-like circulation' },
    { kind: 'lab_block', id: 'gy-energy', position: [7.5, 1.2, 0], size: [3.5, 1.8, 3], color: '#164e63', fromPhase: 'semi', trace: 'energy/logistics systems studio' },
    { kind: 'covered_walk', id: 'gy-veranda', position: [0, 1.2, -2.5], size: [10, 1.6, 1.5], fromPhase: 'semi', trace: 'shaded veranda / elevated connector' },
    { kind: 'operations', id: 'gy-dash', position: [-7.5, 1.2, -2.5], size: [2.5, 1.5, 2.2], fromPhase: 'full', trace: 'public resilience dashboard' },
    { kind: 'lab_block', id: 'gy-hw', position: [5, 1.2, -3], size: [3, 1.6, 2.5], color: '#334155', fromPhase: 'full', trace: 'hardware/network labs' },
    { kind: 'wayfinding', id: 'gy-way', position: [-6, 0, 2.5], size: [0.2, 1.2, 0.2], label: 'River spine', fromPhase: 'pilot' },
  ),
  programZones: zones(
    { id: 'gy1', buildingId: 'gy-hall-a', wingId: 'spine', programKey: 'FLEXIBLE_CLASSROOM', name: 'Classroom', position: [-5, 1.25, 0], fromPhase: 'pilot' },
    { id: 'gy2', buildingId: 'gy-climate', wingId: 'tower', programKey: 'CLIMATE_GIS_STUDIO', name: 'Climate/GIS', position: [1.5, 1.25, 0], fromPhase: 'semi' },
    { id: 'gy3', buildingId: 'gy-dash', wingId: 'civic', programKey: 'PUBLIC_DASHBOARD_WALL', name: 'Dashboard', position: [-7.5, 1.25, -2.5], fromPhase: 'full' },
  ),
  phaseMassing: {
    pilot: { scale: [0.75, 0.85, 0.75] },
    semi: { scale: [0.95, 1, 0.95] },
    full: { scale: [1.1, 1.15, 1.05] },
  },
};

/** Geelong — large-span workshop sheds + maker yard + clean-energy canopy + showcase. */
export const GEELONG_SCENE: CampusSceneDefinition = {
  slug: 'geelong',
  silhouette: 'large-span workshop sheds + maker yard + clean-energy canopy + one civic/showcase volume',
  sitePlan: 'workshop sheds flanking maker yard with gantry reference and solar canopy',
  background: '#9eb0c0',
  groundColor: '#5a5548',
  modules: mods(
    { kind: 'terrain', id: 'ge-terrain', position: [0, 0, 0], size: [22, 0.06, 16], color: '#5a5548' },
    { kind: 'plaza', id: 'ge-yard', position: [0, 0, 0], size: [7, 0.1, 8], fromPhase: 'pilot', trace: 'maker/prototype yard' },
    { kind: 'workshop_shed', id: 'ge-shed-a', position: [-6, 0, 0], size: [5, 3.2, 10], color: '#6b7280', fromPhase: 'pilot', trace: 'sawtooth workshop roof language' },
    { kind: 'workshop_shed', id: 'ge-shed-b', position: [6, 0, 1], size: [5, 2.8, 8], color: '#78716c', fromPhase: 'semi', trace: 'manufacturing/robotics lab shed' },
    { kind: 'solar_canopy', id: 'ge-solar', position: [0, 0, -5], size: [8, 2.8, 4], fromPhase: 'semi', trace: 'clean-energy canopy' },
    { kind: 'gantry', id: 'ge-gantry', position: [0, 0, 4.5], size: [6, 4, 1], fromPhase: 'semi', trace: 'port/logistics gantry reference' },
    { kind: 'lab_block', id: 'ge-design', position: [-2, 0, -6.5], size: [4, 1.8, 2.5], color: '#57534e', fromPhase: 'semi', trace: 'design studio' },
    { kind: 'lab_block', id: 'ge-health', position: [3, 0, -6.5], size: [3.5, 1.6, 2.5], color: '#0f766e', fromPhase: 'full', trace: 'health-tech lab' },
    { kind: 'community_hall', id: 'ge-showcase', position: [0, 0, 7], size: [5, 2.4, 3.5], color: '#b45309', fromPhase: 'full', trace: 'community showcase/event hall' },
    { kind: 'wayfinding', id: 'ge-way', position: [2.5, 0, 1.5], size: [0.2, 1.2, 0.2], label: 'Prototype wall', fromPhase: 'pilot' },
  ),
  programZones: zones(
    { id: 'ge1', buildingId: 'ge-shed-a', wingId: 'workshop', programKey: 'FLEXIBLE_CLASSROOM', name: 'Workshop class', position: [-6, 0.05, -2], fromPhase: 'pilot' },
    { id: 'ge2', buildingId: 'ge-design', wingId: 'studio', programKey: 'DESIGN_BUILD_STUDIO', name: 'Design/build', position: [-2, 0.05, -6.5], fromPhase: 'semi' },
    { id: 'ge3', buildingId: 'ge-showcase', wingId: 'civic', programKey: 'INDUSTRY_PROJECT_BRIEFING_ROOM', name: 'Briefing', position: [0, 0.05, 7], fromPhase: 'full' },
  ),
  phaseMassing: {
    pilot: {
      scale: [0.7, 0.65, 0.7],
      extraModules: [
        { kind: 'temporary_module', id: 'ge-cart', position: [1.5, 0, 1], size: [1.5, 1, 1.2], color: '#a8a29e', fromPhase: 'pilot' },
      ],
    },
    semi: { scale: [0.92, 0.9, 0.92] },
    full: { scale: [1.08, 1.12, 1.05] },
  },
};

/** Germany — ordered brick/steel hall grid + tall service bay + rail edge. */
export const GERMANY_SCENE: CampusSceneDefinition = {
  slug: 'germany',
  silhouette: 'ordered brick/steel hall grid + tall service/industrial bay + disciplined circulation',
  sitePlan: 'precise industrial grid with logistics lane and rail/transit urban edge',
  background: '#8a9aaa',
  groundColor: '#4a4a48',
  modules: mods(
    { kind: 'terrain', id: 'de-terrain', position: [0, 0, 0], size: [22, 0.06, 16], color: '#4a4a48' },
    { kind: 'transit', id: 'de-rail', position: [0, 0, 7], size: [20, 0.1, 1.8], fromPhase: 'pilot', trace: 'rail/transit urban edge' },
    { kind: 'street', id: 'de-lane', position: [0, 0, 4.5], size: [18, 0.08, 1.4], fromPhase: 'pilot', trace: 'logistics/service lane' },
    { kind: 'learning_hall', id: 'de-h1', position: [-5, 0, 0], size: [4, 2.2, 5], color: '#7c2d12', fromPhase: 'pilot', trace: 'apprenticeship hall' },
    { kind: 'learning_hall', id: 'de-h2', position: [0, 0, 0], size: [4, 2.2, 5], color: '#9a3412', fromPhase: 'semi', trace: 'apprenticeship hall grid' },
    { kind: 'learning_hall', id: 'de-h3', position: [5, 0, 0], size: [4, 2.2, 5], color: '#7c2d12', fromPhase: 'full', trace: 'expanded hall grid' },
    { kind: 'workshop_shed', id: 'de-bay', position: [-5, 0, -5.5], size: [4.5, 3.8, 4], color: '#57534e', fromPhase: 'semi', trace: 'tall service/industrial bay' },
    { kind: 'lab_block', id: 'de-i40', position: [0, 0, -5.5], size: [4, 2, 3.5], color: '#44403c', accent: '#38bdf8', fromPhase: 'semi', trace: 'Industry 4.0 / manufacturing systems lab' },
    { kind: 'gallery_hall', id: 'de-docs', position: [5, 0, -5.5], size: [4, 2.4, 3.5], color: '#78716c', fromPhase: 'full', trace: 'documentation / standards gallery' },
    { kind: 'lab_block', id: 'de-cyber', position: [8.5, 0, 1.5], size: [2.8, 1.8, 3], color: '#334155', fromPhase: 'full', trace: 'industrial networking/cyber lab' },
    { kind: 'community_hall', id: 'de-commons', position: [-8.5, 0, 1.5], size: [2.8, 1.8, 3], color: '#a16207', fromPhase: 'full', trace: 'worker commons' },
    { kind: 'wayfinding', id: 'de-way', position: [-2, 0, 3.2], size: [0.2, 1.2, 0.2], label: 'Apprentice path', fromPhase: 'pilot' },
  ),
  programZones: zones(
    { id: 'de1', buildingId: 'de-h1', wingId: 'grid-a', programKey: 'FLEXIBLE_CLASSROOM', name: 'Hall A', position: [-5, 0.05, 0], fromPhase: 'pilot' },
    { id: 'de2', buildingId: 'de-i40', wingId: 'systems', programKey: 'INDUSTRY40_TWIN_LAB', name: 'I4.0 lab', position: [0, 0.05, -5.5], fromPhase: 'semi' },
    { id: 'de3', buildingId: 'de-docs', wingId: 'docs', programKey: 'TECHNICAL_DOCUMENTATION_QUALITY_REVIEW_ROOM', name: 'Docs gallery', position: [5, 0.05, -5.5], fromPhase: 'full' },
  ),
  phaseMassing: {
    pilot: { scale: [0.78, 0.72, 0.78] },
    semi: { scale: [0.94, 0.95, 0.94] },
    full: { scale: [1.06, 1.08, 1.06] },
  },
};

/** Gaza — distributed recovery network modules + truth labels (NOT a conventional campus). */
export const GAZA_SCENE: CampusSceneDefinition = {
  slug: 'gaza',
  silhouette: 'distributed temporary learning modules in a respectful schematic network',
  sitePlan: 'schematic recovery node network — no precise/sensitive real locations',
  truthNote: 'DIGITAL RECOVERY NETWORK — not a permanent campus claim · no sensitive locations',
  background: '#c4b896',
  groundColor: '#a89070',
  modules: mods(
    { kind: 'terrain', id: 'gz-terrain', position: [0, 0, 0], size: [18, 0.06, 16], color: '#a89070' },
    { kind: 'truth_label', id: 'gz-truth', position: [0, 0, 7.5], size: [5, 0.5, 0.1], label: 'Recovery network twin · no site coordinates', fromPhase: 'pilot', trace: 'truth labels visible' },
    { kind: 'courtyard', id: 'gz-circle', position: [0, 0, 0], size: [5, 0.08, 5], color: '#d6c7a1', fromPhase: 'pilot', trace: 'safe temporary learning circle' },
    { kind: 'temporary_module', id: 'gz-learn', position: [0, 0, -3.2], size: [3.2, 1.4, 2.4], color: '#e7d7b1', fromPhase: 'pilot', trace: 'offline learning module' },
    { kind: 'temporary_module', id: 'gz-repair', position: [3.8, 0, -1], size: [2.4, 1.2, 2], color: '#d6c7a1', fromPhase: 'pilot', trace: 'device repair bench' },
    { kind: 'solar_canopy', id: 'gz-solar', position: [-3.5, 0, -1], size: [3.5, 2.2, 3], fromPhase: 'pilot', trace: 'solar/power resilience canopy' },
    { kind: 'temporary_module', id: 'gz-store', position: [3.5, 0, 2.5], size: [2.2, 1.3, 2], color: '#a8a29e', fromPhase: 'pilot', trace: 'secure storage module' },
    { kind: 'temporary_module', id: 'gz-quiet', position: [-3.5, 0, 2.5], size: [2.4, 1.2, 2.2], color: '#f5e6c8', fromPhase: 'pilot', trace: 'psychosocial quiet/decompression space' },
    { kind: 'media_studio', id: 'gz-recon', position: [0, 0, 3.8], size: [3, 1.5, 2.2], fromPhase: 'semi', trace: 'reconstruction documentation studio' },
    { kind: 'lab_block', id: 'gz-teacher', position: [-5.5, 0, 0], size: [2.2, 1.4, 2.5], color: '#a16207', fromPhase: 'semi', trace: 'teacher-support station' },
    { kind: 'operations', id: 'gz-mentor', position: [5.5, 0, 0], size: [2.2, 1.4, 2.2], fromPhase: 'semi', trace: 'remote mentor link' },
    { kind: 'temporary_module', id: 'gz-hub-a', position: [-6, 0, -4.5], size: [2.5, 1.5, 2.2], color: '#d6c7a1', fromPhase: 'full', trace: 'expanded recovery hub node' },
    { kind: 'temporary_module', id: 'gz-hub-b', position: [6, 0, -4.5], size: [2.5, 1.5, 2.2], color: '#d6c7a1', fromPhase: 'full', trace: 'expanded recovery hub node' },
    { kind: 'covered_walk', id: 'gz-link', position: [0, 0, -5.5], size: [10, 1.8, 1.2], fromPhase: 'full', trace: 'network link between nodes' },
    { kind: 'wayfinding', id: 'gz-way', position: [1.8, 0, 1.2], size: [0.2, 1.2, 0.2], label: 'Learning circle', fromPhase: 'pilot' },
  ),
  programZones: zones(
    { id: 'gza1', buildingId: 'gz-circle', wingId: 'circle', programKey: 'SAFE_TEMPORARY_LEARNING_CIRCLE', name: 'Learning circle', position: [0, 0.05, 0], fromPhase: 'pilot' },
    { id: 'gza2', buildingId: 'gz-repair', wingId: 'repair', programKey: 'MOBILE_DEVICE_REPAIR_KIT', name: 'Repair', position: [3.8, 0.05, -1], fromPhase: 'pilot' },
    { id: 'gza3', buildingId: 'gz-recon', wingId: 'docs', programKey: 'RECONSTRUCTION_DOCUMENTATION_STUDIO', name: 'Docs studio', position: [0, 0.05, 3.8], fromPhase: 'semi' },
  ),
  phaseMassing: {
    pilot: { scale: [0.85, 0.8, 0.85] },
    semi: { scale: [1, 0.95, 1] },
    full: {
      scale: [1.12, 1.05, 1.12],
      extraModules: [
        { kind: 'truth_label', id: 'gz-truth-2', position: [0, 0, -7.5], size: [4, 0.4, 0.1], label: 'FULL = recovery hub representation · not a built campus', fromPhase: 'full' },
      ],
    },
  },
};

/** Graham Land — modular research/ops cluster + antenna/sensors + simulation truth. */
export const GRAHAM_SCENE: CampusSceneDefinition = {
  slug: 'graham-land',
  silhouette: 'modular research/operations cluster + antenna/sensor systems + operations visualization layers',
  sitePlan: 'remote-first polar education twin with simulated terrain and partner-reference overlays',
  truthNote: 'REMOTE POLAR EDUCATION TWIN · simulation / partner reference · no WAIKE-owned Antarctic campus',
  background: '#b8c8d8',
  groundColor: '#e8eef5',
  modules: mods(
    { kind: 'terrain', id: 'gl-terrain', position: [0, 0, 0], size: [20, 0.06, 16], color: '#e8eef5' },
    { kind: 'landscape', id: 'gl-ice', position: [0, 0, 5], size: [18, 0.2, 4], color: '#cbd5e1', fromPhase: 'pilot', trace: 'simulated polar terrain' },
    { kind: 'truth_label', id: 'gl-truth', position: [0, 0, 7.2], size: [5, 0.5, 0.1], label: 'Simulation twin · no WAIKE Antarctic ownership', fromPhase: 'pilot', trace: 'truth labels' },
    { kind: 'polar_module', id: 'gl-ops', position: [0, 0, 0], size: [4, 1.8, 3.5], fromPhase: 'pilot', trace: 'operations / remote lab core' },
    { kind: 'polar_module', id: 'gl-climate', position: [-4.5, 0, -1], size: [3.2, 1.6, 2.8], fromPhase: 'pilot', trace: 'climate data lab' },
    { kind: 'antenna', id: 'gl-ant', position: [4.5, 0, -2], size: [1.2, 4.5, 1.2], fromPhase: 'pilot', trace: 'NTN/satellite communications' },
    { kind: 'lab_block', id: 'gl-gis', position: [-4, 0, 2.5], size: [3, 1.5, 2.5], color: '#94a3b8', accent: '#67e8f9', fromPhase: 'semi', trace: 'GIS / remote-sensing studio' },
    { kind: 'lab_block', id: 'gl-sensor', position: [4, 0, 2], size: [3, 1.5, 2.5], color: '#64748b', fromPhase: 'semi', trace: 'sensor/hardware bench' },
    { kind: 'lab_block', id: 'gl-cyber', position: [0, 0, -4], size: [3.5, 1.6, 2.5], color: '#334155', fromPhase: 'semi', trace: 'cybersecurity/research-data lab' },
    { kind: 'operations', id: 'gl-cross', position: [5.5, 0, -4.5], size: [2.8, 1.8, 2.5], fromPhase: 'full', trace: 'cross-campus operations room' },
    { kind: 'media_studio', id: 'gl-exhibit', position: [-5.5, 0, -4.5], size: [2.8, 1.6, 2.5], fromPhase: 'full', trace: 'public exhibit studio' },
    { kind: 'covered_walk', id: 'gl-link', position: [0, 0, -2], size: [8, 1.6, 1.2], fromPhase: 'full', trace: 'modular connector' },
    { kind: 'wayfinding', id: 'gl-way', position: [2, 0, 1.5], size: [0.2, 1.2, 0.2], label: 'Twin ops', fromPhase: 'pilot' },
  ),
  programZones: zones(
    { id: 'gl1', buildingId: 'gl-climate', wingId: 'science', programKey: 'DATA_LAB', name: 'Data lab', position: [-4.5, 0.05, -1], fromPhase: 'pilot' },
    { id: 'gl2', buildingId: 'gl-gis', wingId: 'sensing', programKey: 'GIS_REMOTE_SENSING_STUDIO', name: 'GIS/RS', position: [-4, 0.05, 2.5], fromPhase: 'semi' },
    { id: 'gl3', buildingId: 'gl-cross', wingId: 'ops', programKey: 'CROSS_CAMPUS_OPERATIONS_ROOM', name: 'Ops room', position: [5.5, 0.05, -4.5], fromPhase: 'full' },
  ),
  phaseMassing: {
    pilot: {
      scale: [0.8, 0.75, 0.8],
      extraModules: [
        { kind: 'temporary_module', id: 'gl-cart', position: [2.5, 0, 1], size: [1.4, 1, 1.1], color: '#cbd5e1', fromPhase: 'pilot', trace: 'mobile sensor cart (remote footprint)' },
      ],
    },
    semi: { scale: [0.95, 0.95, 0.95] },
    full: {
      scale: [1.1, 1.1, 1.1],
      extraModules: [
        { kind: 'truth_label', id: 'gl-truth-2', position: [0, 0, -7], size: [4, 0.4, 0.1], label: 'Non-Antarctic polar education hub · partner refs external', fromPhase: 'full' },
      ],
    },
  },
};

export const CAMPUS_SCENES: Record<string, CampusSceneDefinition> = {
  gary: GARY_SCENE,
  ghana: GHANA_SCENE,
  guyana: GUYANA_SCENE,
  geelong: GEELONG_SCENE,
  germany: GERMANY_SCENE,
  gaza: GAZA_SCENE,
  'graham-land': GRAHAM_SCENE,
};

export const SCENE_SLUGS = Object.keys(CAMPUS_SCENES);

/** Lightweight signature for uniqueness gates (site plan + silhouette + module kinds). */
export function sceneSignature(scene: CampusSceneDefinition): string {
  const kinds = scene.modules.map((m) => m.kind).sort().join(',');
  return `${scene.slug}|${scene.sitePlan}|${scene.silhouette}|${kinds}`;
}

export function massingFingerprint(scene: CampusSceneDefinition, tier: PhaseTier): string {
  const modsList = [
    ...scene.modules.filter((m) => !m.fromPhase || m.fromPhase === 'pilot' || (tier !== 'pilot' && m.fromPhase === 'semi') || tier === 'full'),
    ...(scene.phaseMassing[tier].extraModules || []),
  ];
  const scale = scene.phaseMassing[tier].scale.join('x');
  return `${scene.slug}:${tier}:${scale}:${modsList.map((m) => `${m.kind}@${m.position.join(',')}`).join(';')}`;
}
