const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN_RE = /^[A-Za-z0-9_-]{16,256}$/;
const TARGET_RE = /^[a-z0-9][a-z0-9-]{1,127}$/i;
const SITE_KINDS = ['commons', 'home', 'transit', 'campus', 'gallery', 'atlas', 'academic', 'library', 'study', 'lecture', 'media'];
const NODE_KINDS = ['node', 'public'];

function reject(uri, reason) {
  return {
    uri, valid: false, reason, kind: null, node_id: null, campus_slug: null, campus_rest: [],
    scene_id: null, research_id: null, share_token: null, token_present: false,
  };
}

function ok(uri, kind, extra = {}) {
  return {
    uri,
    valid: true,
    reason: null,
    kind,
    node_id: extra.node_id ?? null,
    campus_slug: extra.campus_slug ?? null,
    campus_rest: extra.campus_rest ?? [],
    scene_id: extra.scene_id ?? null,
    research_id: extra.research_id ?? null,
    share_token: extra.share_token ?? null,
    token_present: extra.token_present === true,
  };
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
  if (![...SITE_KINDS, ...NODE_KINDS, 'share', 'scene', 'research'].includes(kind)) {
    return reject(trimmed, 'kind_rejected');
  }

  if (SITE_KINDS.includes(kind) && kind !== 'campus') {
    return ok(trimmed, kind);
  }

  if (kind === 'campus') {
    const slug = (parts[1] || '').toLowerCase();
    return ok(trimmed, kind, {
      campus_slug: slug || null,
      campus_rest: parts.slice(2).map((p) => p.toLowerCase()),
    });
  }

  if (kind === 'scene') {
    const sceneId = (parts[1] || '').toLowerCase();
    if (!TARGET_RE.test(sceneId)) return reject(trimmed, 'scene_rejected');
    return ok(trimmed, kind, { scene_id: sceneId });
  }

  if (kind === 'research') {
    const researchId = (parts[1] || '').toLowerCase();
    if (!TARGET_RE.test(researchId)) return reject(trimmed, 'research_rejected');
    return ok(trimmed, kind, { research_id: researchId });
  }

  const value = parts[1] || '';
  if (kind === 'node' || kind === 'public') {
    if (!UUID_RE.test(value)) return reject(trimmed, 'uuid_rejected');
    return ok(trimmed, kind, { node_id: value });
  }

  if (!TOKEN_RE.test(value)) return reject(trimmed, 'token_rejected');
  return ok(trimmed, kind, { token_present: true, share_token: value });
}

export function buildMlvDeepLink(kind, value) {
  if (kind === 'commons') return 'gunnchos://mlv/commons';
  if (kind === 'home') return 'gunnchos://mlv/home';
  if (kind === 'transit') return 'gunnchos://mlv/transit';
  if (kind === 'gallery') return 'gunnchos://mlv/gallery';
  if (kind === 'campus') return value ? `gunnchos://mlv/campus/${value}` : 'gunnchos://mlv/campus';
  if (['atlas', 'academic', 'library', 'study', 'lecture', 'media'].includes(kind)) {
    return `gunnchos://mlv/${kind}`;
  }
  if (kind === 'node' || kind === 'public') return `gunnchos://mlv/${kind}/${value}`;
  if (kind === 'share') return `gunnchos://mlv/share/${value}`;
  if (kind === 'scene') return `gunnchos://mlv/scene/${value}`;
  if (kind === 'research') return `gunnchos://mlv/research/${value}`;
  throw new Error('unknown mlv deep link kind');
}
