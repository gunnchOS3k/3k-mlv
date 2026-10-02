import { publicDiscoveryFilter, canReadNode, confirmPublish, createPrivateNode, VISIBILITY, visitorVisibleNodes } from '../privacyPolicy.js';
import { campusBySlug } from './model.js';

const COORDINATE_RE = /\b(-?\d{1,3}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})\b/;
const SENSITIVE_KEYS = new Set([
  'lat', 'lon', 'latitude', 'longitude', 'coordinates', 'gps', 'geo',
  'learner_location', 'site_location', 'real_world_address',
]);

export function galleryPublicOnly(nodes) {
  return publicDiscoveryFilter(nodes || []);
}

export function campusPresenceDoesNotExposeHomePrivate({ homeNodes, campusVisibleNodes, actor }) {
  const privateHome = (homeNodes || []).filter((n) => n.visibility === VISIBILITY.PRIVATE);
  const leaked = privateHome.filter((homeNode) =>
    (campusVisibleNodes || []).some((campusNode) => campusNode.id === homeNode.id && homeNode.owner_id !== actor?.id),
  );
  return { pass: leaked.length === 0, leaked_ids: leaked.map((n) => n.id) };
}

export function studyRoomAclAllows({ room, actor }) {
  if (!room) return false;
  if (room.owner_id && actor?.id === room.owner_id) return true;
  const acl = Array.isArray(room.acl) ? room.acl : [];
  return acl.includes(actor?.id);
}

export function friendDoesNotGrantStudyAccess({ room, friendId }) {
  if (!room || !friendId) return true;
  if (room.owner_id === friendId) return true;
  return !studyRoomAclAllows({ room, actor: { id: friendId } });
}

export function houseGuestDoesNotGrantPrivateAccess({ node, guestId }) {
  if (!node) return true;
  return canReadNode({ actor: { id: guestId }, node }) === (node.owner_id === guestId || node.visibility === VISIBILITY.PUBLIC);
}

export function redactGazaSensitive(value, campusSlug) {
  if (campusSlug !== 'gaza') return { value, redacted: false };
  if (value == null) return { value, redacted: false };
  if (typeof value === 'string') {
    if (COORDINATE_RE.test(value)) {
      return { value: value.replace(COORDINATE_RE, '[REDACTED_LOCATION]'), redacted: true };
    }
    return { value, redacted: false };
  }
  if (typeof value === 'object') {
    const next = Array.isArray(value) ? [] : {};
    let redacted = false;
    for (const [key, child] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        next[key] = null;
        redacted = true;
        continue;
      }
      const inner = redactGazaSensitive(child, campusSlug);
      next[key] = inner.value;
      redacted = redacted || inner.redacted;
    }
    return { value: next, redacted };
  }
  return { value, redacted: false };
}

export function gazaSensitiveLocationSuppressed(payload) {
  const campus = campusBySlug('gaza');
  if (!campus?.suppress_sensitive_locations) return { pass: false, reason: 'gaza_suppression_flag_missing' };
  const raw = JSON.stringify(payload ?? {});
  if (COORDINATE_RE.test(raw)) return { pass: false, reason: 'coordinates_present' };
  for (const key of SENSITIVE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(payload || {}, key) && payload[key] != null) {
      return { pass: false, reason: `sensitive_key_${key}` };
    }
  }
  return { pass: true };
}

export function evidenceMetadataHasNoSecrets(metadata) {
  const text = JSON.stringify(metadata ?? {});
  const secretLike = /(api[_-]?key|secret|password|token|private[_-]?key|BEGIN [A-Z ]+PRIVATE KEY)/i;
  return { pass: !secretLike.test(text) };
}

export function createStudyRoom({ ownerId, name, acl = [] }) {
  return {
    id: `study-${ownerId}-${Date.now()}`,
    owner_id: ownerId,
    name: name || 'Study room',
    acl: [...acl],
    kind: 'instanced_study_room',
    unlimited: true,
  };
}

export function createPrivateWorkingCopy(node, actor) {
  if (!node || !actor?.id) return { ok: false, reason: 'missing_actor_or_node' };
  return {
    ok: true,
    node: {
      ...node,
      id: `${node.id}-working-copy-${actor.id}`,
      owner_id: actor.id,
      visibility: VISIBILITY.PRIVATE,
      parent_id: node.id,
      metadata: { ...(node.metadata || {}), working_copy_of: node.id, gallery_edit: true, gallery_zone: 'my_gallery', published: false },
      updated_at: new Date().toISOString(),
    },
  };
}

/** Product wings. Public wings never read My Gallery until an explicit publish. */
export const GALLERY_PRODUCT_ZONES = Object.freeze([
  'local_culture',
  'rotating_institution',
  'exchange_7gc',
  'public_community',
  'my_gallery',
]);

export const PUBLIC_GALLERY_ZONES = Object.freeze([
  'local_culture',
  'rotating_institution',
  'exchange_7gc',
  'public_community',
]);

export function isPrivateGalleryFile(node) {
  if (!node || node.deleted_at) return false;
  const zone = node.metadata?.gallery_zone;
  const galleryFile = zone === 'my_gallery'
    || node.metadata?.gallery_file === true
    || node.metadata?.gallery_edit === true;
  return galleryFile && node.visibility !== VISIBILITY.PUBLIC;
}

export function createMyGalleryAsset({ ownerId, name, mimeType, extra }) {
  if (!ownerId) return { ok: false, reason: 'owner_required' };
  const node = createPrivateNode({
    ownerId,
    name: name || 'Untitled gallery file',
    mimeType: mimeType || 'text/plain',
    extra: {
      ...(extra || {}),
      metadata: {
        ...((extra && extra.metadata) || {}),
        gallery_zone: 'my_gallery',
        gallery_file: true,
        published: false,
      },
    },
  });
  return { ok: true, node };
}

export function publishGalleryAsset(node, { confirmed, wing } = {}) {
  if (!node) return { ok: false, reason: 'missing_node' };
  const destination = PUBLIC_GALLERY_ZONES.includes(wing) ? wing : 'public_community';
  const result = confirmPublish(node, { confirmed: !!confirmed });
  if (!result.ok) return result;
  return {
    ok: true,
    node: {
      ...result.node,
      metadata: {
        ...(result.node.metadata || {}),
        gallery_file: true,
        gallery_zone: destination,
        published: true,
      },
    },
  };
}

export function friendHomeDoesNotRevealPrivateGallery({ homeNodes, friendId }) {
  const visible = visitorVisibleNodes({
    actor: friendId ? { id: friendId } : null,
    nodes: homeNodes || [],
  }).filter((node) => !isPrivateGalleryFile(node));
  const leaked = (homeNodes || []).filter((node) =>
    isPrivateGalleryFile(node)
    && node.owner_id !== friendId
    && visible.some((seen) => seen.id === node.id),
  );
  return { pass: leaked.length === 0, leaked_ids: leaked.map((node) => node.id), visible_ids: visible.map((node) => node.id) };
}

/** Public Gallery wings consume explicitly published assets only. */
export function publicGalleryAssets(nodes) {
  return (nodes || []).filter((node) =>
    node
    && !node.deleted_at
    && node.visibility === VISIBILITY.PUBLIC
    && node.metadata?.published === true,
  );
}
