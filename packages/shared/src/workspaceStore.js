import { createHash, randomBytes } from 'node:crypto';
import {
  VISIBILITY,
  canMutateNode,
  canReadNode,
  confirmPublish,
  createPrivateNode,
  hashShareTokenSync,
  makePrivate,
  presentationForMime,
  publicDiscoveryFilter,
} from './privacyPolicy.js';

function id() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return randomBytes(16).toString('hex').replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

/**
 * In-memory owner-scoped store for local prototype / tests.
 * Not a production database. Isolation rules still apply.
 */
export function createWorkspaceStore() {
  const nodes = new Map();
  const shares = new Map();
  const placements = new Map();
  const instances = new Map();

  return {
    ensurePlayerInstance(ownerId) {
      if (!instances.has(ownerId)) {
        instances.set(ownerId, {
          owner_id: ownerId,
          world_config: { rooms: ['home', 'desk', 'shelf', 'gallery', 'portal', 'backpack'] },
          home_theme: 'cozy',
          spawn: { x: 0, y: 1, z: 4 },
          updated_at: new Date().toISOString(),
        });
      }
      return instances.get(ownerId);
    },

    uploadPrivate({ actor, name, mimeType, bytes, sha256 }) {
      if (!actor?.id) throw new Error('sign-in required');
      const node = createPrivateNode({
        ownerId: actor.id,
        name,
        mimeType,
        extra: {
          id: id(),
          size_bytes: bytes?.byteLength ?? bytes?.length ?? 0,
          sha256: sha256 ?? null,
        },
      });
      nodes.set(node.id, node);
      const placement = {
        id: id(),
        owner_id: actor.id,
        node_id: node.id,
        room_id: 'home.desk',
        position: { x: 0, y: 1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        presentation_type: presentationForMime(mimeType, name),
        created_at: node.created_at,
        updated_at: node.updated_at,
      };
      placements.set(placement.id, placement);
      return { node, placement };
    },

    listVisible({ actor, ownerId, shareContext }) {
      const all = [...nodes.values()].filter((n) => !ownerId || n.owner_id === ownerId);
      return all.filter((node) => canReadNode({ actor, node, shareContext }));
    },

    getNode({ actor, nodeId, shareContext }) {
      const node = nodes.get(nodeId);
      if (!canReadNode({ actor, node, shareContext })) return null;
      return node;
    },

    mutate({ actor, nodeId, patch }) {
      const node = nodes.get(nodeId);
      if (!canMutateNode({ actor, node })) return { ok: false, reason: 'not_owner' };
      const next = { ...node, ...patch, updated_at: new Date().toISOString() };
      nodes.set(nodeId, next);
      return { ok: true, node: next };
    },

    share({ actor, nodeId }) {
      const node = nodes.get(nodeId);
      if (!canMutateNode({ actor, node })) return { ok: false, reason: 'not_owner' };
      const raw = randomBytes(24).toString('base64url');
      const token_hash = hashShareTokenSync(raw, { createHash });
      node.visibility = VISIBILITY.SHARED;
      nodes.set(nodeId, node);
      shares.set(token_hash, {
        id: id(),
        node_id: nodeId,
        owner_id: actor.id,
        token_hash,
        permission: 'view',
        expires_at: null,
        revoked_at: null,
        created_at: new Date().toISOString(),
      });
      return { ok: true, token: raw, node };
    },

    openShare(rawToken) {
      let hash;
      try {
        hash = hashShareTokenSync(rawToken, { createHash });
      } catch {
        return { ok: false, reason: 'invalid_token' };
      }
      const link = shares.get(hash);
      if (!link) return { ok: false, reason: 'unknown_token' };
      const node = nodes.get(link.node_id);
      if (!canReadNode({ actor: null, node, shareContext: link })) {
        return { ok: false, reason: 'token_rejected' };
      }
      return { ok: true, node, shareContext: link };
    },

    revokeShare({ actor, tokenHash }) {
      const link = shares.get(tokenHash);
      if (!link || link.owner_id !== actor?.id) return { ok: false, reason: 'not_owner' };
      link.revoked_at = new Date().toISOString();
      return { ok: true };
    },

    publish({ actor, nodeId, confirmed }) {
      const node = nodes.get(nodeId);
      if (!canMutateNode({ actor, node })) return { ok: false, reason: 'not_owner' };
      const result = confirmPublish(node, { confirmed });
      if (result.ok) nodes.set(nodeId, result.node);
      return result;
    },

    unpublish({ actor, nodeId }) {
      const node = nodes.get(nodeId);
      if (!canMutateNode({ actor, node })) return { ok: false, reason: 'not_owner' };
      const result = makePrivate(node);
      nodes.set(nodeId, result.node);
      for (const link of shares.values()) {
        if (link.node_id === nodeId) link.revoked_at = new Date().toISOString();
      }
      return { ok: true, node: result.node };
    },

    discoverPublic() {
      return publicDiscoveryFilter([...nodes.values()]);
    },

    listPlacements({ actor, ownerId, shareContext }) {
      return [...placements.values()].filter((p) => {
        if (ownerId && p.owner_id !== ownerId) return false;
        const node = nodes.get(p.node_id);
        return canReadNode({ actor, node, shareContext });
      });
    },
  };
}
