import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AFFILIATION_CLAIM,
  CAMPUSES,
  HOUSE_EXTERIOR,
  SCENES,
  TRANSIT_NAMES,
  embodiedCampuses,
  firstDeliverableIds,
} from '../../apps/mlv-web/src/world/sceneGraph.mjs';

const REQUIRED_NAMES = ['Gary', 'Ghana', 'Guyana', 'Geelong', 'Ruhr', 'Gaza', 'Graham Land'];

test('affiliation stays false and Gaza has no coordinates', () => {
  assert.equal(AFFILIATION_CLAIM, false);
  for (const campus of CAMPUSES) {
    assert.equal(campus.affiliation_claim, false);
    assert.equal(campus.coordinates, null);
  }
  const gaza = CAMPUSES.find((campus) => campus.id === 'gaza');
  assert.equal(gaza.suppress_coordinates, true);
  assert.equal(gaza.disclaimer.includes('No coordinates'), true);
  assert.equal(JSON.stringify(gaza).includes('latitude'), false);
});

test('transit plaza names all seven stylized destinations', () => {
  assert.deepEqual(TRANSIT_NAMES, REQUIRED_NAMES);
  const transit = SCENES.transit;
  const labels = transit.portals.filter((portal) => portal.id.startsWith('gate-')).map((portal) => portal.label);
  assert.deepEqual(labels, REQUIRED_NAMES);
  assert.equal(transit.portals.length, 8);
});

test('house exterior is specified beyond a flat block and has two interior rooms', () => {
  assert.equal(HOUSE_EXTERIOR.pitchedRoof, true);
  assert.equal(HOUSE_EXTERIOR.porch, true);
  assert.equal(HOUSE_EXTERIOR.windowsWithTrim, true);
  assert.equal(HOUSE_EXTERIOR.pathToStreet, true);
  assert.equal(HOUSE_EXTERIOR.mailbox, true);
  assert.equal(HOUSE_EXTERIOR.planter, true);
  assert.equal(SCENES.commons.portals.some((portal) => portal.to === 'house-front'), true);
  assert.equal(SCENES['house-front'].kind, 'house-room');
  assert.equal(SCENES['house-study'].kind, 'house-room');
  assert.equal(SCENES['house-front'].portals.some((portal) => portal.to === 'house-study'), true);
});

test('every campus has an enterable exterior, lobby, lab, and gallery', () => {
  const report = embodiedCampuses();
  assert.equal(report.length, 7);
  for (const campus of report) {
    assert.equal(campus.embodied, true, campus.displayName);
    assert.equal(campus.affiliation_claim, false);
    assert.equal(campus.coordinates, null);
    for (const part of ['exterior', 'lobby', 'lab', 'gallery']) {
      const scene = SCENES[`${campus.id}-${part}`];
      assert.ok(scene, `${campus.id}-${part}`);
      assert.equal(scene.kind, `campus-${part}`);
      assert.ok(scene.portals.length >= 1);
    }
    const gallery = SCENES[`${campus.id}-gallery`];
    assert.equal(gallery.blurb.includes('Enterable gallery'), true);
  }
});

test('Ruhr is the stylized label and does not rewrite the Germany catalog slug', () => {
  const ruhr = CAMPUSES.find((campus) => campus.id === 'ruhr');
  assert.equal(ruhr.displayName, 'Ruhr');
  assert.equal(ruhr.catalogSlug, 'germany');
  assert.equal(ruhr.affiliation_claim, false);
});

test('first deliverable scenes all exist', () => {
  for (const id of firstDeliverableIds()) {
    assert.ok(SCENES[id], id);
  }
});
