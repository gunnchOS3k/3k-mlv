import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { createPrivateNode, VISIBILITY } from '../../packages/shared/src/privacyPolicy.js';
import {
  PUBLIC_GALLERY_ZONES,
  createMyGalleryAsset,
  friendHomeDoesNotRevealPrivateGallery,
  publicGalleryAssets,
  publishGalleryAsset,
} from '../../packages/shared/src/campus/privacy.js';

const REQUIRED = ['gary', 'ghana', 'guyana', 'geelong', 'germany', 'gaza', 'graham-land'];

describe('gallery institution sources', () => {
  const doc = JSON.parse(
    readFileSync(new URL('../../data/gallery/v1/institution_sources.json', import.meta.url), 'utf8'),
  );

  it('names all seven campuses without an affiliation claim', () => {
    const slugs = new Set(doc.sources.map((row) => row.campus_slug));
    for (const slug of REQUIRED) assert.equal(slugs.has(slug), true, slug);
    for (const row of doc.sources) {
      assert.equal(row.affiliation_claim, false);
      assert.equal(row.source_url.startsWith('https://'), true);
      assert.equal(Boolean(row.institution && row.city_region && row.why_relevant && row.digital_treatment && row.safety_notes), true);
    }
    const gaza = JSON.stringify(doc.sources.filter((row) => row.campus_slug === 'gaza'));
    assert.equal(/-?\d{1,3}\.\d{3,}/.test(gaza), false);
    const graham = doc.sources.find((row) => row.campus_slug === 'graham-land');
    assert.match(graham.institution, /Port Lockroy/);
  });
});

describe('gallery privacy checks', () => {
  it('keeps My Gallery private until an explicit publish', () => {
    const created = createMyGalleryAsset({ ownerId: 'alice', name: 'local-sketch.png', mimeType: 'image/png' });
    assert.equal(created.ok, true);
    assert.equal(created.node.visibility, VISIBILITY.PRIVATE);
    const friend = friendHomeDoesNotRevealPrivateGallery({
      homeNodes: [created.node],
      friendId: 'bob',
    });
    assert.equal(friend.pass, true);
    assert.equal(friend.visible_ids.includes(created.node.id), false);
    const denied = publishGalleryAsset(created.node, { confirmed: false, wing: 'local_culture' });
    assert.equal(denied.ok, false);
    const published = publishGalleryAsset(created.node, { confirmed: true, wing: 'local_culture' });
    assert.equal(published.ok, true);
    assert.equal(published.node.metadata.gallery_zone, 'local_culture');
    assert.equal(publicGalleryAssets([created.node, published.node]).length, 1);
    assert.equal(PUBLIC_GALLERY_ZONES.includes('rotating_institution'), true);
    const strangerNotes = createPrivateNode({ ownerId: 'alice', name: 'home-notes.md' });
    assert.equal(strangerNotes.visibility, VISIBILITY.PRIVATE);
  });
});
