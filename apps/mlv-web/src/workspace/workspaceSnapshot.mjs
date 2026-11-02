export const BROWSER_WORKSPACE_KEY = 'mlv.v1.browser_workspace';
export const BROWSER_WORKSPACE_VERSION = 1;

function objectArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    : [];
}

export function createWorkspaceSnapshot({ nodes, placements, instances, shares }) {
  return {
    version: BROWSER_WORKSPACE_VERSION,
    saved_at: new Date().toISOString(),
    nodes: objectArray(nodes),
    placements: objectArray(placements),
    instances: objectArray(instances),
    shares: objectArray(shares),
  };
}

export function parseWorkspaceSnapshot(raw) {
  if (!raw || typeof raw !== 'string') return { ok: false, reason: 'empty' };
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }
  if (!parsed || typeof parsed !== 'object' || parsed.version !== BROWSER_WORKSPACE_VERSION) {
    return { ok: false, reason: 'unsupported_version' };
  }
  const snapshot = createWorkspaceSnapshot(parsed);
  return { ok: true, snapshot: { ...snapshot, saved_at: parsed.saved_at || snapshot.saved_at } };
}

