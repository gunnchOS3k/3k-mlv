/**
 * Canonical private-by-default policy used by the app and the Alice/Bob harness.
 * The renderer is not the security boundary — this module is the client-side
 * contract mirror of infra/migrations RLS. Live SQL RLS remains mandatory.
 */

export const VISIBILITY = Object.freeze({
  PRIVATE: 'private',
  SHARED: 'shared',
  PUBLIC: 'public',
});

export const NODE_KIND = Object.freeze({
  FILE: 'file',
  FOLDER: 'folder',
  PROJECT: 'project',
  SHORTCUT: 'shortcut',
  CREATION: 'creation',
});

export const DEFAULT_VISIBILITY = VISIBILITY.PRIVATE;

export function hashShareToken(token, cryptoImpl) {
  if (typeof token !== 'string' || token.length < 16) {
    throw new Error('share token too short');
  }
  const cryptoMod = cryptoImpl || globalThis.crypto;
  if (!cryptoMod?.subtle) {
    throw new Error('subtle crypto required to hash share tokens');
  }
  const bytes = new TextEncoder().encode(token);
  return cryptoMod.subtle.digest('SHA-256', bytes).then((buf) => {
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  });
}

export function hashShareTokenSync(token, nodeCrypto) {
  if (typeof token !== 'string' || token.length < 16) {
    throw new Error('share token too short');
  }
  return nodeCrypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

export function canReadNode({ actor, node, shareContext }) {
  if (!node || node.deleted_at) return false;
  if (actor?.id && actor.id === node.owner_id) return true;
  if (node.visibility === VISIBILITY.PUBLIC) return true;
  if (node.visibility === VISIBILITY.SHARED && shareContext) {
    if (shareContext.revoked_at) return false;
    if (shareContext.expires_at && Date.parse(shareContext.expires_at) <= Date.now()) return false;
    if (shareContext.node_id !== node.id) return false;
    if (shareContext.token_hash && node._presented_hash && shareContext.token_hash !== node._presented_hash) {
      return false;
    }
    return true;
  }
  return false;
}

export function canMutateNode({ actor, node }) {
  if (!actor?.id || !node || node.deleted_at) return false;
  return actor.id === node.owner_id;
}

export function canSeePlacement({ actor, node, shareContext }) {
  if (!node) return false;
  if (node.visibility === VISIBILITY.PRIVATE && !(actor?.id && actor.id === node.owner_id)) {
    return false;
  }
  return canReadNode({ actor, node, shareContext });
}

export function publicDiscoveryFilter(nodes) {
  return (nodes || []).filter((n) => n.visibility === VISIBILITY.PUBLIC && !n.deleted_at);
}

export function visitorVisibleNodes({ actor, nodes, shareContext }) {
  return (nodes || []).filter((node) => {
    if (node.visibility === VISIBILITY.PRIVATE && actor?.id !== node.owner_id) {
      return false;
    }
    return canReadNode({ actor, node, shareContext });
  });
}

export function createPrivateNode({ ownerId, name, mimeType, extra }) {
  if (!ownerId) throw new Error('owner required');
  return {
    id: extra?.id,
    owner_id: ownerId,
    parent_id: extra?.parent_id ?? null,
    kind: extra?.kind ?? NODE_KIND.FILE,
    name,
    mime_type: mimeType ?? 'application/octet-stream',
    size_bytes: extra?.size_bytes ?? 0,
    sha256: extra?.sha256 ?? null,
    storage_key: extra?.storage_key ?? null,
    visibility: DEFAULT_VISIBILITY,
    metadata: extra?.metadata ?? {},
    created_at: extra?.created_at ?? new Date().toISOString(),
    updated_at: extra?.updated_at ?? new Date().toISOString(),
    deleted_at: null,
  };
}

export function confirmPublish(node, { confirmed }) {
  if (!confirmed) {
    return { ok: false, reason: 'publish_requires_explicit_confirmation', node };
  }
  return { ok: true, node: { ...node, visibility: VISIBILITY.PUBLIC, updated_at: new Date().toISOString() } };
}

export function makePrivate(node) {
  return {
    node: { ...node, visibility: VISIBILITY.PRIVATE, updated_at: new Date().toISOString() },
    revokeShareLinks: true,
    removePublicPath: true,
  };
}

export function presentationForMime(mime, name = '') {
  const lower = (mime || '').toLowerCase();
  const ext = name.toLowerCase();
  if (lower.startsWith('image/')) return 'frame';
  if (lower === 'application/pdf') return 'book';
  if (lower.startsWith('audio/')) return 'record';
  if (lower.startsWith('video/')) return 'screen';
  if (lower.includes('gltf') || ext.endsWith('.glb') || ext.endsWith('.gltf')) return 'pedestal';
  if (lower.startsWith('text/') || lower.includes('javascript') || lower.includes('json')) return 'terminal';
  if (ext.endsWith('.apk') || ext.includes('game')) return 'arcade';
  if ((name || '').toLowerCase().includes('waike')) return 'notebook';
  if ((name || '').toLowerCase().includes('research')) return 'lab_console';
  return 'parcel';
}
