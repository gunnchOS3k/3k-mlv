import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { VISIBILITY } from '../../packages/shared/src/privacyPolicy.js';
import { galleryResumeWings } from '../../packages/shared/src/campus/privacy.js';

describe('gallery resume hides unpublished home files', () => {
  it('keeps a private home file out of both gallery wings', () => {
    const wings = galleryResumeWings([
      {
        id: 'home-private',
        owner_id: 'owner-local',
        visibility: VISIBILITY.PRIVATE,
        metadata: { home_file: true, gallery_file: true, gallery_zone: 'my_gallery' },
      },
      {
        id: 'home-unpublished',
        owner_id: 'owner-local',
        visibility: VISIBILITY.PUBLIC,
        metadata: { location: 'home', published: false, gallery_zone: 'public_community' },
      },
      {
        id: 'poster',
        owner_id: 'owner-local',
        visibility: VISIBILITY.PUBLIC,
        metadata: { published: true, gallery_zone: 'public_community' },
      },
      {
        id: 'my-draft',
        owner_id: 'owner-local',
        visibility: VISIBILITY.PRIVATE,
        metadata: { gallery_zone: 'my_gallery', gallery_file: true },
      },
    ], 'owner-local');

    assert.deepEqual(wings.hiddenHomeIds.sort(), ['home-private', 'home-unpublished']);
    assert.deepEqual(wings.published.map((node) => node.id), ['poster']);
    assert.deepEqual(wings.mine.map((node) => node.id), ['my-draft']);
  });
});