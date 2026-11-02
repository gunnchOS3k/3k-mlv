import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  runGaryPlayableAcceptance,
  runGazaPlayable,
  runGermanySpecialtyPlayable,
  runGuyanaSpecialtyPlayable,
  runGrahamSpecialtyPlayable,
  runGeelongSpecialtyPlayable,
  runGhanaOfflinePlayable,
  campusBySlug,
} from '../../packages/shared/src/campus/index.js';

const root = join(fileURLToPath(new URL('../..', import.meta.url)));
const stampPath = join(root, 'data/fidelity/CAMPUS_COVERAGE_NEQ_FINISHED.json');
const briefPath = join(root, 'data/fidelity/ROOM_PROGRAM_BRIEF_DIFF.json');

describe('campus coverage ≠ finished environments', () => {
  it('stamp keeps coverage≠finished and HUMAN/RC2/V1/PIXEL false', () => {
    const stamp = JSON.parse(readFileSync(stampPath, 'utf8'));
    assert.equal(stamp.campus_coverage_neq_finished_environments, true);
    assert.equal(stamp.finished_physical_environments_claimed, false);
    assert.equal(stamp.as_built_facility_claim, false);
    assert.equal(stamp.specialty_journeys_wired_count, 7);
    assert.equal(stamp.campuses.length, 7);
    assert.equal(stamp.gates.PIXEL_7GC_CAMPUS_PASS, false);
    assert.equal(stamp.gates.HUMAN_7GC_SPATIAL_FIDELITY_PASS, false);
    assert.equal(stamp.gates.HUMAN, false);
    assert.equal(stamp.gates.RC2, false);
    assert.equal(stamp.gates.V1, false);
    assert.equal(stamp.gates.CAMPUS_COVERAGE_NEQ_FINISHED_PASS, true);
    assert.match(stamp.note, /not finished physical/i);
  });

  it('room-program brief statuses stay schematic (not as-built)', () => {
    const brief = JSON.parse(readFileSync(briefPath, 'utf8'));
    assert.equal(brief.campuses.length, 7);
    for (const row of brief.campuses) {
      assert.match(String(row.status), /schematic/i);
      assert.match(String(row.status), /PIXEL\/HUMAN false/);
      assert.equal(row.geometry_dimensions, null);
    }
  });

  it('playable specialty paths never claim finished facilities', () => {
    const runners = [
      runGaryPlayableAcceptance(),
      runGhanaOfflinePlayable(),
      runGazaPlayable(),
      runGermanySpecialtyPlayable(),
      runGuyanaSpecialtyPlayable(),
      runGrahamSpecialtyPlayable(),
      runGeelongSpecialtyPlayable(),
    ];
    for (const result of runners) {
      assert.equal(result.ok, true, result.reason);
      assert.equal(result.PIXEL_7GC_CAMPUS_PASS ?? false, false);
      assert.equal(result.HUMAN_7GC_SPATIAL_FIDELITY_PASS ?? false, false);
      if ('as_built_facility_claim' in result) {
        assert.equal(result.as_built_facility_claim, false);
      }
      if ('schematic_planning_twin_only' in result) {
        assert.equal(result.schematic_planning_twin_only, true);
      }
      if ('repair_lab_planning_twin_only' in result) {
        assert.equal(result.repair_lab_planning_twin_only, true);
      }
    }
    const gaza = runGazaPlayable();
    assert.equal(gaza.campus_coverage_neq_finished_environments, true);
    assert.equal(gaza.finished_physical_environments_claimed, false);
    assert.equal(gaza.no_coordinates, true);
    assert.equal(gaza.HUMAN, false);
    assert.equal(gaza.RC2, false);
    assert.equal(gaza.V1, false);
    const geelong = runGeelongSpecialtyPlayable();
    assert.equal(geelong.schematic_planning_twin_only, true);
    assert.equal(geelong.as_built_facility_claim, false);
    assert.equal(geelong.campus_coverage_neq_finished_environments, true);
    assert.equal(geelong.finished_physical_environments_claimed, false);
    assert.equal(geelong.HUMAN, false);
    assert.equal(geelong.RC2, false);
    assert.equal(geelong.V1, false);
  });

  it('catalog campuses remain planning twins (coverage ≠ finished)', () => {
    for (const slug of [
      'gary',
      'guyana',
      'graham-land',
      'ghana',
      'germany',
      'geelong',
      'gaza',
    ]) {
      const campus = campusBySlug(slug);
      assert.ok(campus, slug);
      assert.equal(campus.slug, slug);
      assert.ok(campus.planning_identity, `${slug} missing planning_identity`);
      assert.notEqual(campus.planning_identity, 'finished physical campus');
    }
  });
});

