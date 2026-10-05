const SAFE_TARGET = /^[a-z0-9][a-z0-9._-]{0,127}$/i;

function safeHttpsBase(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

function waikeTarget(destination) {
  try {
    const url = new URL(destination);
    if (url.protocol !== 'waike:') return null;
    const surface = (url.hostname || url.pathname.replace(/^\//, '')).toLowerCase();
    if (!SAFE_TARGET.test(surface)) return null;
    return { surface, campus: url.searchParams.get('campus') || null };
  } catch {
    return null;
  }
}

function researchTarget(destination) {
  try {
    const url = new URL(destination);
    if (url.protocol !== 'research:') return null;
    const parts = [url.hostname, ...url.pathname.split('/')].filter(Boolean);
    const projectId = parts.at(-1)?.toLowerCase() || '';
    return SAFE_TARGET.test(projectId) ? { projectId } : null;
  } catch {
    return null;
  }
}

export function returnSceneHash(context) {
  const sceneId = String(context?.zone || '').toLowerCase();
  return SAFE_TARGET.test(sceneId) ? `#/mlv/scene/${sceneId}` : '#/mlv/commons';
}

/** Build a side-effect-free, testable handoff decision. */
export function createHandoffPlan(kind, destination, options = {}) {
  const returnTo = returnSceneHash(options.returnContext);
  if (kind === 'waike') {
    const target = waikeTarget(destination);
    if (!target) return { ok: false, reason: 'invalid_waike_target' };
    if (options.protocolEnabled === true) {
      return { ok: true, method: 'protocol', url: destination, returnTo, target: target.surface };
    }
    const base = safeHttpsBase(options.webBaseUrl);
    if (base) {
      base.pathname = `${base.pathname.replace(/\/$/, '')}/${encodeURIComponent(target.surface)}`;
      if (target.campus) base.searchParams.set('campus', target.campus);
      base.searchParams.set('return_to', returnTo);
      return { ok: true, method: 'web', url: base.toString(), returnTo, target: target.surface };
    }
    const campus = target.campus ? `?campus=${encodeURIComponent(target.campus)}` : '';
    return {
      ok: true,
      method: 'internal_contract_surface',
      url: `#/mlv/academic/${encodeURIComponent(target.surface)}${campus}`,
      returnTo,
      target: target.surface,
    };
  }
  if (kind === 'research') {
    const target = researchTarget(destination);
    if (!target) return { ok: false, reason: 'invalid_research_target' };
    if (options.protocolEnabled === true) {
      return { ok: true, method: 'protocol', url: destination, returnTo, target: target.projectId };
    }
    const base = safeHttpsBase(options.webBaseUrl);
    if (base) {
      base.pathname = `${base.pathname.replace(/\/$/, '')}/project/${encodeURIComponent(target.projectId)}`;
      base.searchParams.set('return_to', returnTo);
      return { ok: true, method: 'web', url: base.toString(), returnTo, target: target.projectId };
    }
    return {
      ok: true,
      method: 'internal_contract_surface',
      url: `#/mlv/research/${encodeURIComponent(target.projectId)}`,
      returnTo,
      target: target.projectId,
    };
  }
  return { ok: false, reason: 'unsupported_handoff_kind' };
}

