const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN_RE = /^[A-Za-z0-9_-]{16,256}$/;

function reject(uri, reason) {
  return { uri, valid: false, reason, kind: null, node_id: null, token_present: false };
}

/**
 * Parse gunnchos://mlv/... or https hash routes (#/mlv/...).
 * Share tokens are validated for charset/length only — never logged.
 */
export function parseMlvDeepLink(uri) {
  if (!uri || typeof uri !== 'string') return reject(uri, 'empty');
  const trimmed = uri.trim();
  if (trimmed.includes('\0') || trimmed.includes('\\')) return reject(trimmed, 'unsafe_chars');

  let rest = '';
  const lower = trimmed.toLowerCase();
  if (lower.startsWith('gunnchos://mlv/')) {
    rest = trimmed.slice('gunnchos://mlv/'.length);
  } else if (lower.startsWith('gunnchos://mlv')) {
    rest = trimmed.slice('gunnchos://mlv'.length).replace(/^\//, '');
  } else {
    const hash = trimmed.includes('#') ? trimmed.slice(trimmed.indexOf('#') + 1) : trimmed;
    const path = hash.replace(/^\/+/, '');
    if (!path.toLowerCase().startsWith('mlv/')) return reject(trimmed, 'scheme_or_host_rejected');
    rest = path.slice(4);
  }

  const parts = rest.split('/').filter(Boolean);
  const kind = (parts[0] || '').toLowerCase();
  if (!['home', 'node', 'public', 'share'].includes(kind)) {
    return reject(trimmed, 'kind_rejected');
  }

  if (kind === 'home') {
    return { uri: trimmed, valid: true, reason: null, kind, node_id: null, token_present: false };
  }

  const value = parts[1] || '';
  if (kind === 'node' || kind === 'public') {
    if (!UUID_RE.test(value)) return reject(trimmed, 'uuid_rejected');
    return { uri: trimmed, valid: true, reason: null, kind, node_id: value, token_present: false };
  }

  if (!TOKEN_RE.test(value)) return reject(trimmed, 'token_rejected');
  return { uri: trimmed, valid: true, reason: null, kind, node_id: null, token_present: true };
}

export function buildMlvDeepLink(kind, value) {
  if (kind === 'home') return 'gunnchos://mlv/home';
  if (kind === 'node' || kind === 'public') return `gunnchos://mlv/${kind}/${value}`;
  if (kind === 'share') return `gunnchos://mlv/share/${value}`;
  throw new Error('unknown mlv deep link kind');
}
