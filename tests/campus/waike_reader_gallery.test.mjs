import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createPrivateNode, VISIBILITY } from '../../packages/shared/src/privacyPolicy.js';
import { galleryPublicOnly, isPrivateHomeFile } from '../../packages/shared/src/campus/privacy.js';
import { campusWaikeReaderHref, WAIKE_PUBLIC_READER_URL } from '../../packages/shared/src/campus/waikeReader.js';

describe('Campus WAIKE reader and Gallery home files', () => {
  it('links only to the public WAIKE reader', () => {
    const withReturn = 'https://learn.gunnchos.com/?return=https%3A%2F%2Fgunnchos.com';
    assert.equal(WAIKE_PUBLIC_READER_URL, 'https://learn.gunnchos.com');
    assert.equal(campusWaikeReaderHref(undefined), withReturn);
    assert.equal(campusWaikeReaderHref(''), withReturn);
    assert.equal(campusWaikeReaderHref('https://learn.gunnchos.com/'), withReturn);
    assert.equal(campusWaikeReaderHref('https://learn.gunnchos.com/?return=https://gunnchos.com'), withReturn);
    assert.equal(campusWaikeReaderHref('https://learn.gunnchos.com/?return=https://gunnchos.com/'), withReturn);
    assert.equal(campusWaikeReaderHref('https://learn.gunnchos.com/?return=https://example.com'), null);
    assert.equal(campusWaikeReaderHref('https://learn.gunnchos.com/?return=https://gunnchos.com/path'), null);
    assert.equal(campusWaikeReaderHref('https://learn.gunnchos.com/?return=https://gunnchos.com&next=1'), null);
    assert.equal(campusWaikeReaderHref('https://learn.gunnchos.com/lesson/1'), null);
    assert.equal(campusWaikeReaderHref('https://waike.gunnchos-finds.workers.dev/'), null);
    assert.equal(campusWaikeReaderHref('javascript:alert(1)'), null);
  });

  it('keeps private home files out of Gallery', () => {
    const home = createPrivateNode({
      ownerId: 'alice-local',
      name: 'home-notes.md',
      mimeType: 'text/markdown',
      extra: {
        id: '66666666-6666-4666-8666-666666666666',
        metadata: { home_file: true, location: 'home' },
      },
    });
    const mislabeled = { ...home, id: '77777777-7777-4777-8777-777777777777', visibility: VISIBILITY.PUBLIC };
    const poster = {
      id: '88888888-8888-4888-8888-888888888888',
      visibility: VISIBILITY.PUBLIC,
      name: 'campus-poster.png',
      metadata: { published: true, gallery_zone: 'public_community' },
    };
    assert.equal(isPrivateHomeFile(home), true);
    assert.equal(isPrivateHomeFile(mislabeled), true);
    const visible = galleryPublicOnly([home, mislabeled, poster]);
    assert.deepEqual(visible.map((node) => node.id), [poster.id]);
  });
});
