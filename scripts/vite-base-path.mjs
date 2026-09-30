/**
 * Deployment base for Vite.
 * No env and Cloudflare use `/`. GitHub Pages sets VITE_BASE_PATH=/3k-mlv/.
 */
export function normalizeViteBasePath(raw) {
  const rawBase = raw ?? '/';
  return rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
}
