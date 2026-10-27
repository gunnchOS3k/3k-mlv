import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  campusWaikeReaderControl,
  readerDocumentKind,
  WAIKE_PUBLIC_READER_DOCUMENT,
} from '../../packages/shared/src/campus/waikeReader.js';

const SHELL = '<html><body><h1>WAIKE Learning OS</h1><div id="root"></div></body></html>';
const BUILT = `<html><body><nav id="waike-public-tracks"><a href="#/learn/SOFTWARE_BUILDER/2">Software Builder Zero-to-Hero</a></nav><div id="root"></div></body></html>`;
const LOOPBACK = 'http://127.0.0.1:4174/?return=https%3A%2F%2Fgunnchos.com';
const LEARN = 'https://learn.gunnchos.com/?return=https%3A%2F%2Fgunnchos.com';

describe('Campus opens a built track list and still refuses a shell', () => {
  it('links only a loopback built reader with return https://gunnchos.com', () => {
    assert.equal(WAIKE_PUBLIC_READER_DOCUMENT, 'shell');
    assert.equal(readerDocumentKind(SHELL), 'shell');
    const shell = campusWaikeReaderControl(undefined, readerDocumentKind(SHELL));
    assert.equal(shell.href, null);
    assert.equal(shell.state, 'unavailable');

    assert.equal(readerDocumentKind(BUILT), 'tracks');
    const withoutUrl = campusWaikeReaderControl(undefined, readerDocumentKind(BUILT));
    assert.equal(withoutUrl.href, null);
    assert.equal(withoutUrl.state, 'unavailable');

    const learn = campusWaikeReaderControl(LEARN, readerDocumentKind(BUILT));
    assert.equal(learn.href, null);
    assert.equal(learn.state, 'unavailable');

    const tracks = campusWaikeReaderControl(LOOPBACK, readerDocumentKind(BUILT));
    assert.equal(tracks.state, 'link');
    const url = new URL(tracks.href);
    assert.equal(url.hostname, '127.0.0.1');
    assert.equal(url.port, '4174');
    assert.deepEqual([...url.searchParams.keys()], ['return']);
    assert.equal(url.searchParams.get('return'), 'https://gunnchos.com');
    assert.equal(url.hash, '');
  });
});
