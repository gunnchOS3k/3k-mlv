import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { EXAMPLE_REQUIREMENT_IDS } from '../../packages/shared/src/campus/catalog.js';
import { assertNonGenericRoomsets, buildSourceManifest } from '../../packages/shared/src/campus/model.js';
import { evaluateSourceFidelityGates } from '../../packages/shared/src/campus/gates.js';

const root = join(fileURLToPath(new URL('../..', import.meta.url)));

describe('7GC campus source fidelity', () => {
  const manifest = JSON.parse(readFileSync(join(root, 'data/campus/7gc-campus-source-manifest.json'), 'utf8'));
  const live = buildSourceManifest();
  const fidelity = evaluateSourceFidelityGates(manifest);

  it('parses the committed canonical manifest', () => {
    assert.equal(manifest.node_count, 7);
    assert.equal(manifest.campuses.length, 7);
    assert.equal(manifest.requirement_count, live.requirement_count);
  });

  it('fails if a canonical requirement disappears', () => {
    const liveIds = new Set(live.campuses.flatMap((c) => c.requirements.map((r) => r.id)));
    const committedIds = new Set(manifest.campuses.flatMap((c) => c.requirements.map((r) => r.id)));
    for (const id of committedIds) assert.equal(liveIds.has(id), true, `missing ${id}`);
    for (const id of EXAMPLE_REQUIREMENT_IDS) {
      assert.equal(committedIds.has(id), true, `example id missing: ${id}`);
    }
  });

  it('every requirement maps source → phase → digital object/route → function → evidence', () => {
    for (const campus of manifest.campuses) {
      for (const req of campus.requirements) {
        assert.ok(req.source_brief);
        assert.ok(req.source_section);
        assert.ok(req.phase);
        assert.ok(req.digital_object);
        assert.ok(req.digital_route.startsWith('#/mlv/campus/'));
        assert.ok(req.function);
        assert.ok(req.evidence_status);
        assert.ok(req.coverage);
      }
    }
  });

  it('keeps local room programs non-generic', () => {
    const result = assertNonGenericRoomsets();
    assert.equal(result.pass, true, result.reason);
  });

  it('covers all seven phase models', () => {
    assert.equal(fidelity.gates['7GC_PHASE_MODEL_COVERAGE'], '7/7');
    assert.equal(fidelity.gates['7GC_CANONICAL_NODES'], '7/7');
    assert.equal(fidelity.gates['7GC_SOURCE_REQUIREMENTS_PARSED'], '100%');
    assert.equal(fidelity.gates['7GC_DIGITAL_REQUIREMENT_COVERAGE'], '100%');
    assert.equal(fidelity.gates['7GC_ROOM_PROGRAM_COVERAGE'], '100%');
    assert.equal(fidelity.gates['7GC_NON_GENERIC_ROOMSET_PASS'], true);
    assert.equal(fidelity.gates.GAZA_RECOVERY_MODEL_PASS, true);
    assert.equal(fidelity.gates.GAZA_SENSITIVE_LOCATION_REDACTION_PASS, true);
    assert.equal(fidelity.gates.GRAHAM_REMOTE_FIRST_MODEL_PASS, true);
    assert.equal(fidelity.gates.GRAHAM_NO_FAKE_STATION_CLAIM_PASS, true);
  });

  it('keeps human / pixel / merge gates false', () => {
    assert.equal(fidelity.gates.HUMAN_7GC_SPATIAL_FIDELITY_PASS, false);
    assert.equal(fidelity.gates.HUMAN_LOCAL_IDENTITY_PASS, false);
    assert.equal(fidelity.gates.HUMAN_CAMPUS_USABILITY_PASS, false);
    assert.equal(fidelity.gates.HOSTED_MULTIUSER_PASS, false);
    assert.equal(fidelity.gates.PIXEL_7GC_CAMPUS_PASS, false);
    assert.equal(fidelity.gates.MERGE_AUTHORIZED, false);
    assert.equal(fidelity.gates.NEXT_3K_MLV_ACTION, 'OWNER_REVIEW_SEVEN_DIGITAL_CAMPUSES_AND_SOURCE_FIDELITY');
  });

  it('does not imply physical campuses or a WAIKE Antarctic station', () => {
    assert.match(manifest.generated_note, /Not a claim that physical campuses exist/);
    const graham = manifest.campuses.find((c) => c.id === 'GRAHAM');
    assert.equal(graham.no_fake_station_claim, true);
    assert.equal(graham.truth_state, 'DIGITAL_TWIN');
  });
});
