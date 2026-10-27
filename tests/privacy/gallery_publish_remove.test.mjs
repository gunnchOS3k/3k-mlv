import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { VISIBILITY } from '../../packages/shared/src/privacyPolicy.js';
import {
  galleryResumeWings,
  publishGalleryAsset,
  removeGalleryPublication,
} from '../../packages/shared/src/campus/privacy.js';

describe('gallery publish and remove', () => {
  it('refuses a Home file and drops a removed public file from the wings', () => {
    const home = {
      id: 'home-note',
      owner_id: 'owner-local',
      visibility: VISIBILITY.PRIVATE,
      metadata: { home_file: true, gallery_file: true, gallery_zone: 'my_gallery', published: false },
    };
    const refused = publishGalleryAsset(home, { confirmed: true, wing: 'public_community' });
    assert.equal(refused.ok, false);
    assert.equal(refused.reason, 'home_file_stays_private');

    const poster = {
      id: 'poster',
      owner_id: 'owner-local',
      visibility: VISIBILITY.PUBLIC,
      metadata: { published: true, gallery_file: true, gallery_zone: 'public_community' },
    };
    const removed = removeGalleryPublication(poster);
    assert.equal(removed.ok, true);
    const wings = galleryResumeWings([refused.node, removed.node], 'owner-local');
    assert.deepEqual(wings.published, []);
    assert.deepEqual(wings.hiddenHomeIds, ['home-note']);
    assert.equal(wings.mine.some((node) => node.id === 'poster'), true);
  });
});