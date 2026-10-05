import type { MlvNode, MlvWorldPlacement, MlvPlayerInstance } from '@3k-mlv/shared';
import {
  canMutateNode,
  canReadNode,
  confirmPublish,
  createPrivateNode,
  makePrivate,
  presentationForMime,
  publicDiscoveryFilter,
} from '@3k-mlv/shared';
import { isPrivateGalleryFile, publishGalleryAsset } from '@3k-mlv/campus';

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const ALLOWED_PREFIXES = [
  'text/',
  'image/',
  'audio/',
  'video/',
  'application/pdf',
  'application/json',
  'model/gltf',
  'model/gltf-binary',
];

export function isAllowedMime(mime: string): boolean {
  const lower = (mime || '').toLowerCase();
  return ALLOWED_PREFIXES.some((p) => lower.startsWith(p) || lower === p);
}

export async function sha256Hex(buffer: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashShareToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function uuid(): string {
  return crypto.randomUUID();
}

export function createBrowserWorkspace() {
  const nodes = new Map<string, MlvNode>();
  const placements = new Map<string, MlvWorldPlacement>();
  const instances = new Map<string, MlvPlayerInstance>();
  const shares = new Map<string, { node_id: string; owner_id: string; token_hash: string; revoked_at: string | null; expires_at: string | null }>();
  const blobs = new Map<string, Blob>();

  return {
    ensurePlayerInstance(ownerId: string): MlvPlayerInstance {
      if (!instances.has(ownerId)) {
        instances.set(ownerId, {
          owner_id: ownerId,
          world_config: { rooms: ['home', 'desk', 'shelf', 'gallery', 'portal', 'backpack'] },
          home_theme: 'cozy',
          spawn: { x: 0, y: 1, z: 4 },
          updated_at: new Date().toISOString(),
        });
      }
      return instances.get(ownerId)!;
    },

    async uploadPrivate(actor: { id: string }, file: File) {
      if (file.size > MAX_UPLOAD_BYTES) {
        return { ok: false as const, reason: 'too_large' };
      }
      const mime = file.type || 'application/octet-stream';
      if (!isAllowedMime(mime)) {
        return { ok: false as const, reason: 'mime_rejected' };
      }
      const bytes = await file.arrayBuffer();
      const digest = await sha256Hex(bytes);
      const created = createPrivateNode({
        ownerId: actor.id,
        name: file.name,
        mimeType: mime,
        extra: { id: uuid(), size_bytes: file.size, sha256: digest },
      }) as MlvNode;
      nodes.set(created.id, created);
      blobs.set(created.id, new Blob([bytes], { type: mime }));
      const placement: MlvWorldPlacement = {
        id: uuid(),
        owner_id: actor.id,
        node_id: created.id,
        room_id: 'home.desk',
        position: { x: (nodes.size % 5) * 1.4 - 2.8, y: 1, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        presentation_type: presentationForMime(mime, file.name),
        created_at: created.created_at,
        updated_at: created.updated_at,
      };
      placements.set(placement.id, placement);
      return { ok: true as const, node: created, placement };
    },

    listVisible(actor: { id: string } | null, ownerId?: string, shareContext?: { node_id: string; token_hash: string; revoked_at: string | null; expires_at: string | null }) {
      return [...nodes.values()].filter((node) => {
        if (ownerId && node.owner_id !== ownerId) return false;
        if (actor?.id !== node.owner_id && isPrivateGalleryFile(node)) return false;
        return canReadNode({ actor, node, shareContext });
      });
    },

    discoverPublic() {
      return publicDiscoveryFilter([...nodes.values()]);
    },

    listPlacements(actor: { id: string } | null, ownerId?: string, shareContext?: { node_id: string; token_hash: string; revoked_at: string | null; expires_at: string | null }) {
      return [...placements.values()].filter((p) => {
        if (ownerId && p.owner_id !== ownerId) return false;
        const node = nodes.get(p.node_id);
        return canReadNode({ actor, node, shareContext });
      });
    },

    mutate(actor: { id: string }, nodeId: string, patch: Partial<MlvNode>) {
      const node = nodes.get(nodeId);
      if (!canMutateNode({ actor, node })) return { ok: false as const, reason: 'not_owner' };
      const next = { ...node!, ...patch, updated_at: new Date().toISOString() };
      nodes.set(nodeId, next);
      return { ok: true as const, node: next };
    },

    async share(actor: { id: string }, nodeId: string) {
      const node = nodes.get(nodeId);
      if (!canMutateNode({ actor, node })) return { ok: false as const, reason: 'not_owner' };
      const raw = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
      const token_hash = await hashShareToken(raw);
      const next = { ...node!, visibility: 'shared' as const, updated_at: new Date().toISOString() };
      nodes.set(nodeId, next);
      shares.set(token_hash, {
        node_id: nodeId,
        owner_id: actor.id,
        token_hash,
        revoked_at: null,
        expires_at: null,
      });
      return { ok: true as const, token: raw, node: next };
    },

    async openShare(rawToken: string) {
      const token_hash = await hashShareToken(rawToken);
      const link = shares.get(token_hash);
      if (!link) return { ok: false as const, reason: 'unknown_token' };
      const node = nodes.get(link.node_id);
      if (!canReadNode({ actor: null, node, shareContext: link })) {
        return { ok: false as const, reason: 'token_rejected' };
      }
      return { ok: true as const, node, shareContext: link };
    },

    publish(actor: { id: string }, nodeId: string, confirmed: boolean) {
      const node = nodes.get(nodeId);
      if (!canMutateNode({ actor, node })) return { ok: false as const, reason: 'not_owner' };
      const result = confirmPublish(node!, { confirmed });
      if (result.ok) nodes.set(nodeId, result.node as MlvNode);
      return result;
    },

    publishGallery(actor: { id: string }, nodeId: string, confirmed: boolean, wing: 'public_community' | 'exchange_7gc') {
      const node = nodes.get(nodeId);
      if (!canMutateNode({ actor, node })) return { ok: false as const, reason: 'not_owner' };
      const result = publishGalleryAsset(node!, { confirmed, wing });
      if (result.ok) nodes.set(nodeId, result.node as MlvNode);
      return result;
    },

    unpublish(actor: { id: string }, nodeId: string) {
      const node = nodes.get(nodeId);
      if (!canMutateNode({ actor, node })) return { ok: false as const, reason: 'not_owner' };
      const result = makePrivate(node!);
      const metadata = { ...(result.node.metadata || {}) };
      if (metadata.gallery_zone || metadata.gallery_file || metadata.published) {
        metadata.published = false;
        metadata.gallery_zone = 'my_gallery';
        metadata.gallery_file = true;
      }
      const next = { ...result.node, metadata } as MlvNode;
      nodes.set(nodeId, next);
      for (const link of shares.values()) {
        if (link.node_id === nodeId) link.revoked_at = new Date().toISOString();
      }
      return { ok: true as const, node: next };
    },

    insertNode(actor: { id: string }, node: MlvNode) {
      if (!actor?.id || node.owner_id !== actor.id) {
        return { ok: false as const, reason: 'not_owner' };
      }
      nodes.set(node.id, node);
      return { ok: true as const, node };
    },

    blobFor(actor: { id: string } | null, nodeId: string, shareContext?: { node_id: string; token_hash: string; revoked_at: string | null; expires_at: string | null }) {
      const node = nodes.get(nodeId);
      if (!canReadNode({ actor, node, shareContext })) return null;
      return blobs.get(nodeId) ?? null;
    },
  };
}

export type BrowserWorkspace = ReturnType<typeof createBrowserWorkspace>;
