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

export function campusWaikeReaderHref(value) {
  const raw = typeof value === 'string' && value.trim() ? value.trim() : READER_WITH_RETURN;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password || url.port) return null;
  if (url.hostname !== 'learn.gunnchos.com') return null;
  if (url.pathname !== '/' || url.hash) return null;
  const keys = [...url.searchParams.keys()];
  if (keys.length === 0) return READER_WITH_RETURN;
  if (keys.length !== 1 || keys[0] !== 'return') return null;
  if (portalReturnTarget(url.searchParams.get('return')) !== CAMPUS_PORTAL_RETURN_URL) return null;
  return READER_WITH_RETURN;
}

export function campusWaikeReaderControl(value, documentKind = WAIKE_PUBLIC_READER_DOCUMENT) {
  const href = campusWaikeReaderHref(value);
  if (documentKind !== 'tracks') {
    return { state: 'unavailable', href: null, reason: 'public_document_is_shell' };
  }
  if (!href) return { state: 'unavailable', href: null, reason: 'reader_url_rejected' };
  return { state: 'link', href, reason: null };
}
