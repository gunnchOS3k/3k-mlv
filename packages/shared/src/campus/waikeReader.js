export const WAIKE_PUBLIC_READER_URL = 'https://learn.gunnchos.com';
export const CAMPUS_PORTAL_RETURN_URL = 'https://gunnchos.com';
/** Live https://learn.gunnchos.com first HTML is the WAIKE Learning OS shell. It does not list tracks. */
export const WAIKE_PUBLIC_READER_DOCUMENT = 'shell';

const READER_WITH_RETURN = `${WAIKE_PUBLIC_READER_URL}/?return=${encodeURIComponent(CAMPUS_PORTAL_RETURN_URL)}`;

function portalReturnTarget(value) {
  let back;
  try {
    back = new URL(value);
  } catch {
    return null;
  }
  if (back.protocol !== 'https:') return null;
  if (back.username || back.password || back.port) return null;
  if (back.hostname !== 'gunnchos.com') return null;
  if (back.pathname !== '/' || back.search || back.hash) return null;
  return CAMPUS_PORTAL_RETURN_URL;
}

function loopbackPreviewHref(url) {
  if (url.protocol !== 'http:') return null;
  if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') return null;
  if (url.username || url.password) return null;
  if (url.pathname !== '/' || url.hash) return null;
  const keys = [...url.searchParams.keys()];
  if (keys.length !== 1 || keys[0] !== 'return') return null;
  if (portalReturnTarget(url.searchParams.get('return')) !== CAMPUS_PORTAL_RETURN_URL) return null;
  const host = url.hostname === 'localhost' ? '127.0.0.1' : url.hostname;
  const port = url.port ? `:${url.port}` : '';
  return `http://${host}${port}/?return=${encodeURIComponent(CAMPUS_PORTAL_RETURN_URL)}`;
}

/**
 * Campus may open a built reader only on loopback preview.
 * It does not point at https://learn.gunnchos.com.
 */
export function campusWaikeReaderHref(value) {
  const raw = typeof value === 'string' && value.trim() ? value.trim() : '';
  if (!raw) return null;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.hostname === 'learn.gunnchos.com') return null;
  return loopbackPreviewHref(url);
}

export function readerDocumentKind(html) {
  if (typeof html !== 'string') return 'shell';
  if (!html.includes('id="waike-public-tracks"')) return 'shell';
  if (!/#\/learn\/[A-Z0-9_]+\//.test(html)) return 'shell';
  return 'tracks';
}

export function campusWaikeReaderControl(value, documentKind = WAIKE_PUBLIC_READER_DOCUMENT) {
  if (documentKind !== 'tracks') {
    return { state: 'unavailable', href: null, reason: 'public_document_is_shell' };
  }
  const href = campusWaikeReaderHref(value);
  if (!href) return { state: 'unavailable', href: null, reason: 'reader_url_rejected' };
  return { state: 'link', href, reason: null };
}

/**
 * Preview of built MLV Home → Campus → a built WAIKE track list.
 * The public Campus control stays on the shell document and is not activated.
 * The lesson target is the hash inside that built document, not learn.gunnchos.com.
 * joinedBrowserExecuted stays false unless a real same-job browser session set it.
 */
export function previewBuiltReaderHandoff({ readerHtml, homeFileId, joinedBrowserExecuted = false }) {
  const publicLink = campusWaikeReaderControl(undefined, WAIKE_PUBLIC_READER_DOCUMENT);
  const kind = readerDocumentKind(readerHtml);
  const match = typeof readerHtml === 'string'
    ? readerHtml.match(/href="(#\/learn\/[A-Z0-9_]+\/\d+)"/)
    : null;
  const lessonHref = kind === 'tracks' && match ? match[1] : null;
  const leaked = Boolean(lessonHref && homeFileId && lessonHref.includes(String(homeFileId)));
  const pointsAtLearnHost = Boolean(lessonHref && lessonHref.includes('learn.gunnchos.com'));
  return {
    joinedBrowserExecuted: Boolean(joinedBrowserExecuted),
    publicCampusActivated: publicLink.state === 'link',
    publicCampusHref: publicLink.href,
    pointsAtLearnHost,
    documentKind: kind,
    lessonHref: leaked || pointsAtLearnHost ? null : lessonHref,
    returnTo: lessonHref && !leaked && !pointsAtLearnHost ? CAMPUS_PORTAL_RETURN_URL : null,
  };
}
