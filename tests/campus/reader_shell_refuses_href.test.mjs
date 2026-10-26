import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  campusWaikeReaderControl,
  WAIKE_PUBLIC_READER_DOCUMENT,
} from '../../packages/shared/src/campus/waikeReader.js';

const WITH_RETURN = 'https://learn.gunnchos.com/?return=https%3A%2F%2Fgunnchos.com';

describe('Campus reader document kind', () => {
  it('gives a shell no href and lets a tracks document carry only the gunnchos.com return', () => {
    assert.equal(WAIKE_PUBLIC_READER_DOCUMENT, 'shell');
    const shell = campusWaikeReaderControl(WITH_RETURN, 'shell');
    assert.equal(shell.state, 'unavailable');
    assert.equal(shell.href, null);
    assert.equal(shell.reason, 'public_document_is_shell');

    const tracks = campusWaikeReaderControl(WITH_RETURN, 'tracks');
    assert.equal(tracks.state, 'link');
    const url = new URL(tracks.href);
    assert.equal(url.origin + url.pathname, 'https://learn.gunnchos.com/');
    assert.deepEqual([...url.searchParams.keys()], ['return']);
    assert.equal(url.searchParams.get('return'), 'https://gunnchos.com');

    const extra = campusWaikeReaderControl('https://learn.gunnchos.com/?return=https://gunnchos.com&next=1', 'tracks');
    assert.equal(extra.href, null);
    assert.equal(extra.state, 'unavailable');
  });
});
