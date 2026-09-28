import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createPrivateNode, VISIBILITY } from '../../packages/shared/src/privacyPolicy.js';
import { parseMlvDeepLink } from '../../packages/shared/src/deepLinks.js';
import {
  campusPresenceDoesNotExposeHomePrivate,
  createPrivateWorkingCopy,
  createStudyRoom,
  evidenceMetadataHasNoSecrets,
  friendDoesNotGrantStudyAccess,
  galleryPublicOnly,
  gazaSensitiveLocationSuppressed,
  redactGazaSensitive,
  studyRoomAclAllows,
} from '../../packages/shared/src/campus/privacy.js';
import { consumeWaikeContract, emptyWaikeContract } from '../../packages/shared/src/campus/waikeContract.js';

const ALICE = { id: 'alice-1111-1111-1111-111111111111' };
const BOB = { id: 'bob-2222-2222-2222-222222222222' };

describe('Campus / Gallery / study-room privacy', () => {
  const privateNotes = createPrivateNode({
    ownerId: ALICE.id,
    name: 'home-private-notes.md',
    mimeType: 'text/markdown',
    extra: { id: '11111111-1111-4111-8111-111111111111' },
  });
  const publicPoster = {
    ...createPrivateNode({
      ownerId: ALICE.id,
      name: 'public-poster.png',
      mimeType: 'image/png',
      extra: { id: '33333333-3333-4333-8333-333333333333' },
    }),
    visibility: VISIBILITY.PUBLIC,
  };

  it('campus presence does not expose Home PRIVATE files', () => {
    const result = campusPresenceDoesNotExposeHomePrivate({
      homeNodes: [privateNotes],
      campusVisibleNodes: [],
      actor: BOB,
    });
    assert.equal(result.pass, true);
  });

  it('Gallery is PUBLIC only', () => {
    const discovered = galleryPublicOnly([privateNotes, publicPoster]);
    assert.equal(discovered.length, 1);
    assert.equal(discovered[0].id, publicPoster.id);
  });

  it('public project edits use a private working copy', () => {
    const copy = createPrivateWorkingCopy(publicPoster, BOB);
    assert.equal(copy.ok, true);
    assert.equal(copy.node.visibility, VISIBILITY.PRIVATE);
    assert.equal(copy.node.owner_id, BOB.id);
    assert.equal(copy.node.metadata.working_copy_of, publicPoster.id);
  });

  it('study room ACL is explicit; friend != ACL', () => {
    const room = createStudyRoom({ ownerId: ALICE.id, name: 'Quiet booth', acl: [] });
    assert.equal(studyRoomAclAllows({ room, actor: ALICE }), true);
    assert.equal(studyRoomAclAllows({ room, actor: BOB }), false);
    assert.equal(friendDoesNotGrantStudyAccess({ room, friendId: BOB.id }), true);
  });

  it('Gaza sensitive-location suppression holds', () => {
    const raw = { lat: 31.501, lon: 34.466, notes: 'learner home' };
    const redacted = redactGazaSensitive(raw, 'gaza');
    assert.equal(redacted.redacted, true);
    assert.equal(redacted.value.lat, null);
    assert.equal(redacted.value.lon, null);
    assert.equal(gazaSensitiveLocationSuppressed({ campus: 'gaza', notes: 'recovery network' }).pass, true);
    assert.equal(gazaSensitiveLocationSuppressed({ lat: 31.5 }).pass, false);
  });

  it('evidence metadata carries no secrets', () => {
    assert.equal(evidenceMetadataHasNoSecrets({ source: 'brief', phase: 'PILOT' }).pass, true);
    assert.equal(evidenceMetadataHasNoSecrets({ api_key: 'secret-value' }).pass, false);
  });

  it('WAIKE campus surfaces do not invent LMS rows', () => {
    const unbound = consumeWaikeContract(null);
    assert.equal(unbound.bound, false);
    assert.equal(unbound.surfaces.today.items.length, 0);
    assert.equal(emptyWaikeContract().surfaces.courses.available, false);
  });

  it('campus and gallery deep links parse without tokens', () => {
    const campus = parseMlvDeepLink('gunnchos://mlv/campus/gary');
    assert.equal(campus.valid, true);
    assert.equal(campus.kind, 'campus');
    assert.equal(campus.campus_slug, 'gary');
    const gallery = parseMlvDeepLink('#/mlv/gallery');
    assert.equal(gallery.valid, true);
    assert.equal(gallery.kind, 'gallery');
    assert.equal(gallery.token_present, false);
  });
});
