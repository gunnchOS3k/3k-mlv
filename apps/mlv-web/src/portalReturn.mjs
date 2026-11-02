/**
 * Public gateway return. Not a secret.
 * The guest target is https://gunnchos.com.
 * VITE_GUNNCHOS_PORTAL_URL may name another public http(s) host.
 * The old workers.dev preview host is not a guest return target.
 */
export const GUEST_PORTAL_URL = 'https://gunnchos.com';

function isPreviewHost(hostname) {
  const host = hostname.toLowerCase();
  return host === 'gunnchos-finds.workers.dev' || host.endsWith('.gunnchos-finds.workers.dev');
}

export function portalReturnHref(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return GUEST_PORTAL_URL;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (isPreviewHost(url.hostname)) return GUEST_PORTAL_URL;
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}
