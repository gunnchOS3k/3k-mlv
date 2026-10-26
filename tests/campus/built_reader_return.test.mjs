import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  campusWaikeReaderControl,
  readerDocumentKind,
  WAIKE_PUBLIC_READER_DOCUMENT,
} from '../../packages/shared/src/campus/waikeReader.js';

const SHELL = '<html><body><h1>WAIKE Learning OS</h1><div id="root"></div></body></html>';
const BUILT = `<html><body><nav id="waike-public-tracks"><a href="#/learn/SOFTWARE_BUILDER/2">Software Builder Zero-to-Hero</a></nav><div id="root"></div></body></html>`;

describe('Campus opens a built track list and still refuses a shell', () => {
  it('links only when the built reader lists a lesson, and the return is https://gunnchos.com', () => {
    assert.equal(WAIKE_PUBLIC_READER_DOCUMENT, 'shell');
    assert.equal(readerDocumentKind(SHELL), 'shell');
    const shell = campusWaikeReaderControl(undefined, readerDocumentKind(SHELL));
    assert.equal(shell.href, null);
    assert.equal(shell.state, 'unavailable');

    assert.equal(readerDocumentKind(BUILT), 'tracks');
    const tracks = campusWaikeReaderControl(undefined, readerDocumentKind(BUILT));
    assert.equal(tracks.state, 'link');
    const url = new URL(tracks.href);
    assert.deepEqual([...url.searchParams.keys()], ['return']);
    assert.equal(url.searchParams.get('return'), 'https://gunnchos.com');
    assert.equal(url.hash, '');
  });
});
