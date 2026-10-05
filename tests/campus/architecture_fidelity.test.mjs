import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(fileURLToPath(new URL('../..', import.meta.url)));
const SLUGS = ['gary', 'ghana', 'guyana', 'geelong', 'germany', 'gaza', 'graham-land'];
const REQUIRED = [
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

describe('V4 7GC architectural fidelity', () => {
  it('rebuilds architecture gate artifacts', () => {
    const result = spawnSync(process.execPath, ['scripts/build-architecture-fidelity.mjs'], {
      cwd: root,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  });

  it('has architecture JSON for all seven campuses with required fields', () => {
    for (const slug of SLUGS) {
      const path = join(root, `data/campus/v4/${slug}.architecture.json`);
      assert.equal(existsSync(path), true, path);
      const doc = JSON.parse(readFileSync(path, 'utf8'));
      for (const field of REQUIRED) {
        assert.ok(Array.isArray(doc[field]) && doc[field].length > 0, `${slug}.${field}`);
      }
    }
  });

  it('passes technical architectural fidelity gates and keeps human/pixel false', () => {
    const gates = JSON.parse(
      readFileSync(join(root, 'artifacts/campus/v4/ARCHITECTURE_FIDELITY_GATES.json'), 'utf8'),
    );
    assert.equal(gates.technical_pass, true);
    assert.equal(gates.gates.SEVEN_UNIQUE_SITE_PLANS_PASS, true);
    assert.equal(gates.gates.SEVEN_UNIQUE_MASSING_SILHOUETTES_PASS, true);
    assert.equal(gates.gates.NO_VISIBLE_ROOM_BOX_PLACEHOLDER_PASS, true);
    assert.equal(gates.gates.CAMPUS_BRIEF_TRACEABILITY_PASS, true);
    assert.equal(gates.gates.GARY_ARCHITECTURAL_IDENTITY_PASS, true);
    assert.equal(gates.gates.GHANA_ARCHITECTURAL_IDENTITY_PASS, true);
    assert.equal(gates.gates.GUYANA_ARCHITECTURAL_IDENTITY_PASS, true);
    assert.equal(gates.gates.GEELONG_ARCHITECTURAL_IDENTITY_PASS, true);
    assert.equal(gates.gates.GERMANY_ARCHITECTURAL_IDENTITY_PASS, true);
    assert.equal(gates.gates.GAZA_NONCONVENTIONAL_NETWORK_TRUTH_PASS, true);
    assert.equal(gates.gates.GRAHAM_LAND_REMOTE_TWIN_TRUTH_PASS, true);
    assert.equal(gates.gates.STATIC_7GC_MODULE_BUDGET_PASS, true);
    assert.equal(gates.gates.PIXEL_7GC_PERFORMANCE_BUDGET_PASS, false);
    assert.equal(gates.gates.ACCESSIBLE_DIRECT_NAV_PARITY_PASS, true);
    assert.equal(gates.gates.PIXEL_7GC_CAMPUS_PASS, false);
    assert.equal(gates.gates.HUMAN_7GC_SPATIAL_FIDELITY_PASS, false);
    assert.equal(gates.gates.HUMAN_LOCAL_IDENTITY_PASS, false);
    assert.equal(gates.gates.HUMAN_CAMPUS_USABILITY_PASS, false);
    assert.equal(gates.gates.NEXT_3K_MLV_ACTION, 'OWNER_PIXEL_REVIEW_V4_SEVEN_CAMPUSES');
  });

  it('emits architecture requirement traceability', () => {
    const trace = JSON.parse(
      readFileSync(join(root, 'artifacts/campus/v4/ARCHITECTURE_REQUIREMENT_TRACEABILITY.json'), 'utf8'),
    );
    assert.ok(trace.row_count > 50);
    assert.equal(Object.keys(trace.scene_fingerprints).length, 7);
  });

  it('CampusWorld composes architecture assemblies instead of room boxes', () => {
    const src = readFileSync(join(root, 'apps/mlv-web/src/three/CampusWorld.tsx'), 'utf8');
    assert.match(src, /CampusArchitecture/);
    assert.doesNotMatch(src, /rooms\.map/);
    assert.doesNotMatch(src, /positionFor/);
  });

  it('keeps institution sources for seven campuses with affiliation false', () => {
    const doc = JSON.parse(readFileSync(join(root, 'data/gallery/v1/institution_sources.json'), 'utf8'));
    const slugs = new Set(doc.sources.map((row) => row.campus_slug));
    for (const slug of SLUGS) assert.equal(slugs.has(slug), true, slug);
    for (const row of doc.sources) {
      assert.equal(row.affiliation_claim, false, row.institution);
      assert.ok(row.source_url.startsWith('https://'), row.institution);
      assert.ok(row.city_region && row.why_relevant && row.digital_treatment && row.safety_notes);
    }
    const raw = JSON.stringify(doc.sources.filter((row) => row.campus_slug === 'gaza' || row.campus_slug === 'graham-land'));
    assert.doesNotMatch(raw, /\b-?\d{1,3}\.\d{3,}\s*,\s*-?\d{1,3}\.\d{3,}\b/);
    assert.match(raw, /No WAIKE-owned|no permanent gunnchOS station|Not a gunnchOS|no invented/i);
  });

  it('writes schematic owner review captures without flipping human or pixel gates', () => {
    const result = spawnSync(process.execPath, ['scripts/build-owner-review-captures.mjs'], {
      cwd: root,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr || result.stdout);
    const index = JSON.parse(readFileSync(join(root, 'artifacts/campus/v4/owner_review/INDEX.json'), 'utf8'));
    assert.equal(index.pixel_framebuffer, false);
    assert.equal(index.PIXEL_7GC_CAMPUS_PASS, false);
    assert.equal(index.HUMAN_7GC_SPATIAL_FIDELITY_PASS, false);
    assert.equal(index.campuses.length, 7);
    const views = ['aerial', 'street', 'entry', 'program', 'gallery', 'truth', 'grayscale'];
    for (const slug of SLUGS) {
      for (const view of views) {
        assert.equal(existsSync(join(root, `artifacts/campus/v4/owner_review/${slug}/${view}.svg`)), true);
      }
    }
  });

  it('preserves list mode and phase selector in DigitalCampus', () => {
    const src = readFileSync(join(root, 'apps/mlv-web/src/campus/DigitalCampus.tsx'), 'utf8');
    assert.match(src, /setMode\('list'\)/);
    assert.match(src, /mlv-room-grid/);
    assert.match(src, /phaseId/);
    assert.match(src, /CampusWorld/);
  });
});
