/**
 * Public gateway return. Not a secret.
 * Preview and production hosts are supplied by VITE_GUNNCHOS_PORTAL_URL.
 */
export function portalReturnHref(raw) {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}
