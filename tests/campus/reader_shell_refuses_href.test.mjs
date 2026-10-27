import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  campusWaikeReaderControl,
  WAIKE_PUBLIC_READER_DOCUMENT,
} from '../../packages/shared/src/campus/waikeReader.js';

const WITH_RETURN = 'https://learn.gunnchos.com/?return=https%3A%2F%2Fgunnchos.com';
const LOOPBACK = 'http://127.0.0.1:4174/?return=https%3A%2F%2Fgunnchos.com';

describe('Campus reader document kind', () => {
  it('gives a shell no href and never points Campus at learn.gunnchos.com', () => {
    assert.equal(WAIKE_PUBLIC_READER_DOCUMENT, 'shell');
    const shell = campusWaikeReaderControl(WITH_RETURN, 'shell');
    assert.equal(shell.state, 'unavailable');
    assert.equal(shell.href, null);
    assert.equal(shell.reason, 'public_document_is_shell');

    const learnTracks = campusWaikeReaderControl(WITH_RETURN, 'tracks');
    assert.equal(learnTracks.state, 'unavailable');
    assert.equal(learnTracks.href, null);

    const loopback = campusWaikeReaderControl(LOOPBACK, 'tracks');
    assert.equal(loopback.state, 'link');
    const url = new URL(loopback.href);
    assert.equal(url.hostname, '127.0.0.1');
    assert.deepEqual([...url.searchParams.keys()], ['return']);
    assert.equal(url.searchParams.get('return'), 'https://gunnchos.com');

    const extra = campusWaikeReaderControl('http://127.0.0.1:4174/?return=https://gunnchos.com&next=1', 'tracks');
    assert.equal(extra.href, null);
    assert.equal(extra.state, 'unavailable');
  });
});
