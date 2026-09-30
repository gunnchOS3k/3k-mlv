import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { portalReturnHref } from '../../apps/mlv-web/src/portalReturn.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const preview = 'https://gunnchos-site.gunnchos-finds.workers.dev';
const production = 'https://gunnchos.com';

test('portal return parses public http(s) URLs and rejects anything else', () => {
  assert.equal(portalReturnHref(undefined), null);
  assert.equal(portalReturnHref(''), null);
  assert.equal(portalReturnHref('   '), null);
  assert.equal(portalReturnHref('not a url'), null);
  assert.equal(portalReturnHref('javascript:alert(1)'), null);
  assert.equal(portalReturnHref(`${preview}/`), preview);
  assert.equal(portalReturnHref(production), production);
});

test('world shell uses the configured portal href and keeps hash routes', () => {
  const app = fs.readFileSync(path.join(root, 'apps/mlv-web/src/App.tsx'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'apps/mlv-web/src/index.css'), 'utf8');
  assert.match(app, /portalReturnHref\(import\.meta\.env\.VITE_GUNNCHOS_PORTAL_URL\)/);
  assert.match(app, /aria-label="Return to gunnchOS"/);
  assert.match(app, /← gunnchOS/);
  assert.match(app, /<PortalReturn href=\{portalHref\} \/>/);
  assert.match(app, /<a className="mlv-portal-return" href=\{href\}/);
  assert.doesNotMatch(app, /workers\.dev/);
  assert.doesNotMatch(app, /gunnchos\.com/);
  assert.doesNotMatch(app, /iframe/i);
  assert.doesNotMatch(app, /history\.(pushState|replaceState)/);
  assert.doesNotMatch(app, /location\.replace/);
  assert.match(app, /window\.location\.hash = '#\/mlv\/home'/);
  assert.match(app, /window\.location\.hash = '#\/mlv\/campus'/);
  assert.match(app, /window\.location\.hash = '#\/mlv\/gallery'/);
  assert.match(css, /\.mlv-portal-return:focus-visible/);
  assert.match(css, /min-height:\s*44px/);
});
