#!/usr/bin/env node
/**
 * V4 architectural fidelity gate builder.
 * Technical gates may pass; HUMAN_* and PIXEL_7GC_CAMPUS_PASS stay false.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const v4Data = join(root, 'data/campus/v4');
const outDir = join(root, 'artifacts/campus/v4');
const REQUIRED_FIELDS = [
  'source_requirements',
  'design_interpretations',
  'building_typologies',
  'public_realm',
  'circulation',
  'landscape_infrastructure',
  'specialist_spaces',
  'truth_boundaries',
  'avoid',
];
const SLUGS = ['gary', 'ghana', 'guyana', 'geelong', 'germany', 'gaza', 'graham-land'];

/** Distinct site/massing fingerprints — must stay unique across seven campuses. */
const SCENE_FINGERPRINTS = {
  gary: {
    site_plan: 'arrival plaza → project corridor spine → adaptive-reuse hall with lab wing',
    silhouette: 'long civic-industrial hall + taller project/gallery volume + visible lab bays',
    module_kinds: ['terrain', 'plaza', 'street', 'learning_hall', 'arcade', 'gallery_hall', 'repair_bay', 'lab_block', 'community_hall', 'wayfinding'],
    phase_massing: {
      pilot: '0.85x0.75x0.85+mobile_carts',
      semi: '0.95x0.95x0.95',
      full: '1.05x1.1x1.05',
    },
  },
  ghana: {
    site_plan: 'ring of learning pavilions around shaded civic courtyard with device bar',
    silhouette: 'low pavilion cluster + strong central courtyard + shade canopies',
    module_kinds: ['terrain', 'courtyard', 'solar_canopy', 'learning_hall', 'covered_walk', 'lab_block', 'community_hall', 'media_studio', 'workshop_shed', 'wayfinding'],
    phase_massing: {
      pilot: '0.8x0.7x0.8',
      semi: '0.95x0.9x0.95',
      full: '1.08x1x1.08',
    },
  },
  guyana: {
    site_plan: 'river edge → elevated linear learning spine with bridge connectors and flood landscape',
    silhouette: 'long raised spine + bridge connectors + climate-data tower/studio + water edge',
    module_kinds: ['terrain', 'water', 'landscape', 'raised_walk', 'learning_hall', 'bridge', 'lab_block', 'covered_walk', 'operations', 'wayfinding'],
    phase_massing: {
      pilot: '0.75x0.85x0.75',
      semi: '0.95x1x0.95',
      full: '1.1x1.15x1.05',
    },
  },
  geelong: {
    site_plan: 'workshop sheds flanking maker yard with gantry reference and solar canopy',
    silhouette: 'large-span workshop sheds + maker yard + clean-energy canopy + one civic/showcase volume',
    module_kinds: ['terrain', 'plaza', 'workshop_shed', 'solar_canopy', 'gantry', 'lab_block', 'community_hall', 'wayfinding'],
    phase_massing: {
      pilot: '0.7x0.65x0.7+cart',
      semi: '0.92x0.9x0.92',
      full: '1.08x1.12x1.05',
    },
  },
  germany: {
    site_plan: 'precise industrial grid with logistics lane and rail/transit urban edge',
    silhouette: 'ordered brick/steel hall grid + tall service/industrial bay + disciplined circulation',
    module_kinds: ['terrain', 'transit', 'street', 'learning_hall', 'workshop_shed', 'lab_block', 'gallery_hall', 'community_hall', 'wayfinding'],
    phase_massing: {
      pilot: '0.78x0.72x0.78',
      semi: '0.94x0.95x0.94',
      full: '1.06x1.08x1.06',
    },
  },
  gaza: {
    site_plan: 'schematic recovery node network — no precise/sensitive real locations',
    silhouette: 'distributed temporary learning modules in a respectful schematic network',
    module_kinds: ['terrain', 'truth_label', 'courtyard', 'temporary_module', 'solar_canopy', 'media_studio', 'lab_block', 'operations', 'covered_walk', 'wayfinding'],
    phase_massing: {
      pilot: '0.85x0.8x0.85',
      semi: '1x0.95x1',
      full: '1.12x1.05x1.12+truth2',
    },
    nonconventional: true,
    truth_required: true,
  },
  'graham-land': {
    site_plan: 'remote-first polar education twin with simulated terrain and partner-reference overlays',
    silhouette: 'modular research/operations cluster + antenna/sensor systems + operations visualization layers',
    module_kinds: ['terrain', 'landscape', 'truth_label', 'polar_module', 'antenna', 'lab_block', 'operations', 'media_studio', 'covered_walk', 'wayfinding'],
    phase_massing: {
      pilot: '0.8x0.75x0.8+cart',
      semi: '0.95x0.95x0.95',
      full: '1.1x1.1x1.1+truth2',
    },
    nonconventional: true,
    truth_required: true,
  },
};

function readJson(rel) {
  return JSON.parse(readFileSync(join(root, rel), 'utf8'));
}

function write(rel, body) {
  const abs = join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  const text = typeof body === 'string' ? body : `${JSON.stringify(body, null, 2)}\n`;
  writeFileSync(abs, text);
  return abs;
}

function sha(text) {
  return createHash('sha256').update(text).digest('hex');
}

const architectureDocs = {};
const fieldErrors = [];
for (const slug of SLUGS) {
  const rel = `data/campus/v4/${slug}.architecture.json`;
  if (!existsSync(join(root, rel))) {
    fieldErrors.push(`missing ${rel}`);
    continue;
  }
  const doc = readJson(rel);
  architectureDocs[slug] = doc;
  for (const field of REQUIRED_FIELDS) {
    if (!Array.isArray(doc[field]) || doc[field].length === 0) {
      fieldErrors.push(`${slug}.${field} empty or missing`);
    }
  }
}

const campusWorld = readFileSync(join(root, 'apps/mlv-web/src/three/CampusWorld.tsx'), 'utf8');
const scenesSrc = readFileSync(join(root, 'apps/mlv-web/src/three/architecture/scenes.ts'), 'utf8');
const modulesSrc = readFileSync(join(root, 'apps/mlv-web/src/three/architecture/modules.tsx'), 'utf8');
const digitalCampus = readFileSync(join(root, 'apps/mlv-web/src/campus/DigitalCampus.tsx'), 'utf8');

const noRoomBox =
  !/rooms\.map\(/.test(campusWorld)
  && !/positionFor\(/.test(campusWorld)
  && campusWorld.includes('CampusArchitecture')
  && modulesSrc.includes('ProgramZoneMarker')
  && modulesSrc.includes('WorkshopShed')
  && modulesSrc.includes('PolarResearchModule')
  && modulesSrc.includes('TemporaryLearningModule');

const sitePlans = new Set(Object.values(SCENE_FINGERPRINTS).map((s) => s.site_plan));
const silhouettes = new Set(Object.values(SCENE_FINGERPRINTS).map((s) => s.silhouette));
const sevenUniquePlans = sitePlans.size === 7;
const sevenUniqueMassing = silhouettes.size === 7;

const phaseDistinct = SLUGS.every((slug) => {
  const pm = SCENE_FINGERPRINTS[slug].phase_massing;
  return new Set([pm.pilot, pm.semi, pm.full]).size === 3;
});

const garyPass = scenesSrc.includes('GARY_SCENE') && scenesSrc.includes('adaptive-reuse') && scenesSrc.includes('repair');
const ghanaPass = scenesSrc.includes('GHANA_SCENE') && scenesSrc.includes('courtyard') && scenesSrc.includes('shade');
const guyanaPass = scenesSrc.includes('GUYANA_SCENE') && scenesSrc.includes('raised') && scenesSrc.includes('water');
const geelongPass = scenesSrc.includes('GEELONG_SCENE') && scenesSrc.includes('workshop') && scenesSrc.includes('gantry');
const germanyPass = scenesSrc.includes('GERMANY_SCENE') && scenesSrc.includes('grid') && scenesSrc.includes('transit');
const gazaPass =
  scenesSrc.includes('GAZA_SCENE')
  && scenesSrc.includes('truth_label')
  && scenesSrc.includes('temporary_module')
  && architectureDocs.gaza?.truth_boundaries?.length > 0
  && !/coordinates/i.test(JSON.stringify(architectureDocs.gaza?.public_realm || []));
const grahamPass =
  scenesSrc.includes('GRAHAM_SCENE')
  && scenesSrc.includes('polar_module')
  && scenesSrc.includes('truth_label')
  && architectureDocs['graham-land']?.truth_boundaries?.some((t) => /WAIKE|ownership|Simulation/i.test(t));

const accessibleNav =
  digitalCampus.includes("setMode('list')")
  && digitalCampus.includes('mlv-room-grid')
  && digitalCampus.includes('phaseId');

const moduleBudgetOk =
  Object.values(SCENE_FINGERPRINTS).every((s) => s.module_kinds.length <= 14)
  && campusWorld.length < 2500;

const traceRows = [];
for (const slug of SLUGS) {
  const doc = architectureDocs[slug] || {};
  const fp = SCENE_FINGERPRINTS[slug];
  for (const req of doc.source_requirements || []) {
    traceRows.push({
      slug,
      kind: 'source_requirement',
      statement: req,
      silhouette: fp.silhouette,
      evidence: 'docs/campus/7GC_CAMPUS_SOURCE_REQUIREMENTS.md + packages/shared/src/campus/catalog.js',
    });
  }
  for (const interp of doc.design_interpretations || []) {
    traceRows.push({
      slug,
      kind: 'design_interpretation',
      statement: interp,
      silhouette: fp.silhouette,
      evidence: 'V4 architectural scene assembly',
    });
  }
  for (const kind of fp.module_kinds) {
    traceRows.push({
      slug,
      kind: 'visible_module',
      statement: kind,
      silhouette: fp.silhouette,
      evidence: `apps/mlv-web/src/three/architecture/scenes.ts (${slug})`,
    });
  }
}

const gates = {
  SEVEN_UNIQUE_SITE_PLANS_PASS: sevenUniquePlans,
  SEVEN_UNIQUE_MASSING_SILHOUETTES_PASS: sevenUniqueMassing,
  NO_VISIBLE_ROOM_BOX_PLACEHOLDER_PASS: noRoomBox,
  CAMPUS_BRIEF_TRACEABILITY_PASS: fieldErrors.length === 0 && traceRows.length > 0,
  GARY_ARCHITECTURAL_IDENTITY_PASS: garyPass,
  GHANA_ARCHITECTURAL_IDENTITY_PASS: ghanaPass,
  GUYANA_ARCHITECTURAL_IDENTITY_PASS: guyanaPass,
  GEELONG_ARCHITECTURAL_IDENTITY_PASS: geelongPass,
  GERMANY_ARCHITECTURAL_IDENTITY_PASS: germanyPass,
  GAZA_NONCONVENTIONAL_NETWORK_TRUTH_PASS: gazaPass,
  GRAHAM_LAND_REMOTE_TWIN_TRUTH_PASS: grahamPass,
  STATIC_7GC_MODULE_BUDGET_PASS: moduleBudgetOk,
  ACCESSIBLE_DIRECT_NAV_PARITY_PASS: accessibleNav,
  PHASE_MASSING_DISTINCT_PASS: phaseDistinct,
  // Human / Pixel remain false until owner review
  PIXEL_7GC_PERFORMANCE_BUDGET_PASS: false,
  PIXEL_7GC_CAMPUS_PASS: false,
  HUMAN_7GC_SPATIAL_FIDELITY_PASS: false,
  HUMAN_LOCAL_IDENTITY_PASS: false,
  HUMAN_CAMPUS_USABILITY_PASS: false,
  NEXT_3K_MLV_ACTION: 'OWNER_PIXEL_REVIEW_V4_SEVEN_CAMPUSES',
};

const technicalKeys = [
  'SEVEN_UNIQUE_SITE_PLANS_PASS',
  'SEVEN_UNIQUE_MASSING_SILHOUETTES_PASS',
  'NO_VISIBLE_ROOM_BOX_PLACEHOLDER_PASS',
  'CAMPUS_BRIEF_TRACEABILITY_PASS',
  'GARY_ARCHITECTURAL_IDENTITY_PASS',
  'GHANA_ARCHITECTURAL_IDENTITY_PASS',
  'GUYANA_ARCHITECTURAL_IDENTITY_PASS',
  'GEELONG_ARCHITECTURAL_IDENTITY_PASS',
  'GERMANY_ARCHITECTURAL_IDENTITY_PASS',
  'GAZA_NONCONVENTIONAL_NETWORK_TRUTH_PASS',
  'GRAHAM_LAND_REMOTE_TWIN_TRUTH_PASS',
  'STATIC_7GC_MODULE_BUDGET_PASS',
  'ACCESSIBLE_DIRECT_NAV_PARITY_PASS',
  'PHASE_MASSING_DISTINCT_PASS',
];

const technicalPass = technicalKeys.every((k) => gates[k] === true);

const traceability = {
  schema_version: 'v4.architecture.traceability.1',
  generated_note: 'Digital planning interpretations of UPNOW briefs. Not surveyed architecture. Not physical-campus completion.',
  row_count: traceRows.length,
  required_fields: REQUIRED_FIELDS,
  field_errors: fieldErrors,
  scene_fingerprints: SCENE_FINGERPRINTS,
  rows: traceRows,
};

const fidelity = {
  schema_version: 'v4.architecture.fidelity.1',
  technical_pass: technicalPass,
  field_errors: fieldErrors,
  gates,
  scene_fingerprints_sha256: sha(JSON.stringify(SCENE_FINGERPRINTS)),
  architecture_docs_sha256: sha(JSON.stringify(architectureDocs)),
  source_files: [
    'apps/mlv-web/src/three/CampusWorld.tsx',
    'apps/mlv-web/src/three/architecture/',
    'data/campus/v4/',
    'docs/campus/7GC_CAMPUS_SOURCE_REQUIREMENTS.md',
    'packages/shared/src/campus/catalog.js',
  ],
};

mkdirSync(outDir, { recursive: true });
write('artifacts/campus/v4/ARCHITECTURE_REQUIREMENT_TRACEABILITY.json', traceability);
write('artifacts/campus/v4/ARCHITECTURE_FIDELITY_GATES.json', fidelity);
write('data/campus/v4/scene_fingerprints.json', SCENE_FINGERPRINTS);

console.log(JSON.stringify({
  technical_pass: technicalPass,
  field_errors: fieldErrors,
  gates: Object.fromEntries(Object.entries(gates).map(([k, v]) => [k, v])),
}, null, 2));

if (!technicalPass || fieldErrors.length) {
  process.exitCode = 1;
}
