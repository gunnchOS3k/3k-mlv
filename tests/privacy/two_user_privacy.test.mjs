import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';
import { describe, it } from 'node:test';

import {
  VISIBILITY,
  canMutateNode,
  canReadNode,
  canSeePlacement,
  confirmPublish,
  createPrivateNode,
  hashShareTokenSync,
  makePrivate,
  publicDiscoveryFilter,
  visitorVisibleNodes,
} from '../../packages/shared/src/privacyPolicy.js';

import { parseMlvDeepLink } from '../../packages/shared/src/deepLinks.js';

const ALICE = { id: 'alice-1111-1111-1111-111111111111' };
const BOB = { id: 'bob-2222-2222-2222-222222222222' };
const ANON = null;

function token() {
  return randomBytes(24).toString('base64url');
}

describe('Alice / Bob / anonymous privacy harness', () => {
  const store = {
    nodes: new Map(),
    shares: new Map(),
  };

  const notes = createPrivateNode({
    ownerId: ALICE.id,
    name: 'private-notes.md',
    mimeType: 'text/markdown',
    extra: { id: '11111111-1111-4111-8111-111111111111', sha256: 'abc' },
  });
  store.nodes.set(notes.id, notes);

  it('upload defaults PRIVATE', () => {
    assert.equal(notes.visibility, VISIBILITY.PRIVATE);
  });

  it('owner can read PRIVATE', () => {
    assert.equal(canReadNode({ actor: ALICE, node: notes }), true);
  });

  it('other user cannot read PRIVATE', () => {
    assert.equal(canReadNode({ actor: BOB, node: notes }), false);
    assert.equal(visitorVisibleNodes({ actor: BOB, nodes: [notes] }).length, 0);
  });

  it('anonymous cannot read PRIVATE', () => {
    assert.equal(canReadNode({ actor: ANON, node: notes }), false);
  });

  it('PRIVATE is absent to visitors, not a locked placeholder', () => {
    const visible = visitorVisibleNodes({ actor: BOB, nodes: [notes] });
    assert.equal(visible.find((n) => n.id === notes.id), undefined);
  });

  it('non-owner cannot mutate node', () => {
    assert.equal(canMutateNode({ actor: BOB, node: notes }), false);
    assert.equal(canMutateNode({ actor: ALICE, node: notes }), true);
  });

  it('placement cannot expose PRIVATE', () => {
    assert.equal(canSeePlacement({ actor: BOB, node: notes }), false);
    assert.equal(canSeePlacement({ actor: ANON, node: notes }), false);
    assert.equal(canSeePlacement({ actor: ALICE, node: notes }), true);
  });

  const image = createPrivateNode({
    ownerId: ALICE.id,
    name: 'shared-photo.png',
    mimeType: 'image/png',
    extra: { id: '22222222-2222-4222-8222-222222222222' },
  });
  image.visibility = VISIBILITY.SHARED;
  store.nodes.set(image.id, image);

  const rawToken = token();
  const tokenHash = hashShareTokenSync(rawToken, { createHash });
  store.shares.set(tokenHash, {
    node_id: image.id,
    token_hash: tokenHash,
    revoked_at: null,
    expires_at: null,
  });

  it('anonymous cannot read SHARED by UUID', () => {
    assert.equal(canReadNode({ actor: ANON, node: image }), false);
  });

  it('valid SHARED token opens exactly the intended node', () => {
    const presented = hashShareTokenSync(rawToken, { createHash });
    const ctx = store.shares.get(presented);
    const opened = { ...image, _presented_hash: presented };
    assert.equal(canReadNode({ actor: ANON, node: opened, shareContext: ctx }), true);
    assert.equal(ctx.node_id, image.id);
    assert.equal(canReadNode({ actor: ANON, node: notes, shareContext: ctx }), false);
  });

  it('SHARED is excluded from public discovery', () => {
    const discovered = publicDiscoveryFilter([...store.nodes.values()]);
    assert.equal(discovered.some((n) => n.id === image.id), false);
  });

  const pdf = createPrivateNode({
    ownerId: ALICE.id,
    name: 'public-report.pdf',
    mimeType: 'application/pdf',
    extra: { id: '33333333-3333-4333-8333-333333333333' },
  });
  store.nodes.set(pdf.id, pdf);

  it('publish requires explicit confirmation', () => {
    const denied = confirmPublish(pdf, { confirmed: false });
    assert.equal(denied.ok, false);
    const allowed = confirmPublish(pdf, { confirmed: true });
    assert.equal(allowed.ok, true);
    store.nodes.set(pdf.id, allowed.node);
  });

  it('anonymous may discover and read PUBLIC', () => {
    const published = store.nodes.get(pdf.id);
    assert.equal(published.visibility, VISIBILITY.PUBLIC);
    assert.equal(canReadNode({ actor: ANON, node: published }), true);
    assert.equal(publicDiscoveryFilter([published]).length, 1);
  });

  it('unpublish removes public access', () => {
    const result = makePrivate(store.nodes.get(pdf.id));
    store.nodes.set(pdf.id, result.node);
    assert.equal(result.node.visibility, VISIBILITY.PRIVATE);
    assert.equal(canReadNode({ actor: ANON, node: result.node }), false);
    assert.equal(publicDiscoveryFilter([result.node]).length, 0);
  });

  it('revoked token fails', () => {
    store.shares.get(tokenHash).revoked_at = new Date().toISOString();
    const ctx = store.shares.get(tokenHash);
    assert.equal(canReadNode({ actor: ANON, node: image, shareContext: ctx }), false);
  });

  it('expired token fails', () => {
    const expiredCtx = {
      node_id: image.id,
      token_hash: tokenHash,
      revoked_at: null,
      expires_at: new Date(Date.now() - 1000).toISOString(),
    };
    image.visibility = VISIBILITY.SHARED;
    assert.equal(canReadNode({ actor: ANON, node: image, shareContext: expiredCtx }), false);
  });

  it('gunnchOS deep link opens MLV home/node routes', () => {
    const home = parseMlvDeepLink('gunnchos://mlv/home');
    assert.equal(home.valid, true);
    assert.equal(home.kind, 'home');
    const node = parseMlvDeepLink(`gunnchos://mlv/node/${notes.id}`);
    assert.equal(node.valid, true);
    assert.equal(node.kind, 'node');
    assert.equal(node.node_id, notes.id);
    const bad = parseMlvDeepLink('gunnchos://mlv/node/not-a-uuid');
    assert.equal(bad.valid, false);
  });
});
