import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('../..', import.meta.url)));

describe('honest 3D program focus + vite capture script', () => {
  it('CampusArchitecture imports Text and accepts focusedProgramKey', () => {
    const src = readFileSync(join(root, 'apps/mlv-web/src/three/architecture/CampusArchitecture.tsx'), 'utf8');
    assert.match(src, /import \{ Text \} from '@react-three\/drei'/);
    assert.match(src, /focusedProgramKey/);
    assert.match(src, /planning twin/);
    assert.doesNotMatch(src, /PIXEL.*true|HUMAN.*true/);
  });

  it('ProgramZoneMarker supports focused highlight without fidelity claim', () => {
    const src = readFileSync(join(root, 'apps/mlv-web/src/three/architecture/modules.tsx'), 'utf8');
    assert.match(src, /focused\?: boolean/);
    assert.match(src, /focused \? '#86efac'/);
  });

  it('all campus scenes expose honest truthNote or inherit default copy', () => {
    const src = readFileSync(join(root, 'apps/mlv-web/src/three/architecture/scenes.ts'), 'utf8');
    for (const slug of ['gary', 'ghana', 'guyana', 'geelong', 'germany', 'gaza', 'graham-land']) {
      assert.match(src, new RegExp(`slug: '${slug}'`));
    }
    assert.match(src, /truthNote: 'Gary civic planning twin/);
    assert.match(src, /truthNote: 'Ghana-led planning twin/);
    assert.match(src, /DIGITAL RECOVERY NETWORK/);
    assert.match(src, /REMOTE POLAR EDUCATION TWIN/);
    // Gary specialty journey room keys bind to schematic program zones (not surveyed rooms).
    for (const key of [
      'MOBILE_HARDWARE_CART',
      'QUIET_SUPPORT_AREA',
      'PRESENTATION_WALL',
      'STAFF_PLANNING_TABLE',
      'DEVICE_HELP_DESK_TABLE',
    ]) {
      assert.match(src, new RegExp(`programKey: '${key}'`));
    }
  });

  it('CampusArchitecture surfaces silhouette/sitePlan as schematic honesty labels', () => {
    const src = readFileSync(join(root, 'apps/mlv-web/src/three/architecture/CampusArchitecture.tsx'), 'utf8');
    assert.match(src, /Silhouette \(schematic\)/);
    assert.match(src, /Site plan \(authored\)/);
    assert.match(src, /scene\.silhouette/);
    assert.match(src, /scene\.sitePlan/);
  });

  it('vite live capture script exists and keeps PIXEL/HUMAN false', () => {
    const path = join(root, 'scripts/capture-vite-live-review.mjs');
    assert.equal(existsSync(path), true);
    const src = readFileSync(path, 'utf8');
    assert.match(src, /PIXEL_7GC_CAMPUS_PASS: false/);
    assert.match(src, /HUMAN_7GC_SPATIAL_FIDELITY_PASS: false/);
    assert.match(src, /Enter local test identity/);
    assert.match(src, /data-campus-slug/);
  });
});
