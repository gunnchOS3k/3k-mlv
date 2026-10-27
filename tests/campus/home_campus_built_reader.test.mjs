import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isPrivateHomeFile } from '../../packages/shared/src/campus/privacy.js';
import {
  previewBuiltReaderHandoff,
  WAIKE_PUBLIC_READER_DOCUMENT,
} from '../../packages/shared/src/campus/waikeReader.js';

const SHELL = '<html><body><h1>WAIKE Learning OS</h1><div id="root"></div></body></html>';
const BUILT = '<html><body><nav id="waike-public-tracks"><a href="#/learn/NETWORKING_INFRA/2">Networking and Internet Infrastructure</a></nav><div id="root"></div></body></html>';

describe('Home to Campus to a built reader stays off the public host', () => {
  it('keeps the public Campus link off and returns only to https://gunnchos.com', () => {
    const home = {
      id: 'home-private-notes',
      visibility: 'private',
      metadata: { home_file: true },
    };
    assert.equal(isPrivateHomeFile(home), true);
    assert.equal(WAIKE_PUBLIC_READER_DOCUMENT, 'shell');

    const shell = previewBuiltReaderHandoff({ readerHtml: SHELL, homeFileId: home.id });
    assert.equal(shell.joinedBrowserExecuted, false);
    assert.equal(shell.publicCampusActivated, false);
    assert.equal(shell.publicCampusHref, null);
    assert.equal(shell.lessonHref, null);
    assert.equal(shell.pointsAtLearnHost, false);

    const built = previewBuiltReaderHandoff({ readerHtml: BUILT, homeFileId: home.id });
    assert.equal(built.joinedBrowserExecuted, false);
    assert.equal(built.publicCampusActivated, false);
    assert.equal(built.publicCampusHref, null);
    assert.equal(built.pointsAtLearnHost, false);
    assert.equal(built.documentKind, 'tracks');
    assert.equal(built.lessonHref, '#/learn/NETWORKING_INFRA/2');
    assert.equal(built.returnTo, 'https://gunnchos.com');
    assert.equal(built.lessonHref.includes(home.id), false);
    assert.equal(built.lessonHref.includes('learn.gunnchos.com'), false);
    assert.equal(WAIKE_PUBLIC_READER_DOCUMENT, 'shell');
  });
});
