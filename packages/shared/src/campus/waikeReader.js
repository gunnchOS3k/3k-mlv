export const WAIKE_PUBLIC_READER_URL = 'https://learn.gunnchos.com';

export function campusWaikeReaderHref(value) {
  const raw = typeof value === 'string' && value.trim() ? value.trim() : WAIKE_PUBLIC_READER_URL;
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password || url.port) return null;
  if (url.hostname !== 'learn.gunnchos.com') return null;
  if (url.pathname !== '/' || url.search || url.hash) return null;
  return WAIKE_PUBLIC_READER_URL;
}
