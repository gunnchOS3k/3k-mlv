import { publicDiscoveryFilter, canReadNode, VISIBILITY } from '../privacyPolicy.js';
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
      metadata: { ...(node.metadata || {}), working_copy_of: node.id, gallery_edit: true },
      updated_at: new Date().toISOString(),
    },
  };
}
