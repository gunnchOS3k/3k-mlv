import { WAIKE_CONTRACT_SURFACES } from './catalog.js';

/**
 * Campus consumes the WAIKE contract. It never invents LMS rows.
 * An unbound adapter returns honest empty surfaces.
 */
export function emptyWaikeContract(reason = 'WAIKE contract not bound in this prototype') {
  return {
    bound: false,
    reason,
    surfaces: Object.fromEntries(
      WAIKE_CONTRACT_SURFACES.map((id) => [id, { id, items: [], available: false }]),
    ),
  };
}

export function consumeWaikeContract(adapter) {
  if (!adapter || typeof adapter.readSurfaces !== 'function') {
    return emptyWaikeContract();
  }
  const read = adapter.readSurfaces();
  const surfaces = {};
  for (const id of WAIKE_CONTRACT_SURFACES) {
    const incoming = read?.[id];
    surfaces[id] = {
      id,
      items: Array.isArray(incoming?.items) ? incoming.items : [],
      available: incoming?.available === true,
    };
  }
  return { bound: true, reason: null, surfaces };
}

export function specialistWaikeDeepLink(trackId) {
  if (!trackId || typeof trackId !== 'string') return null;
  return `gunnchos://waike/track/${encodeURIComponent(trackId)}`;
}

export const SPECIALIST_WAIKE_TRACKS = Object.freeze({
  HARDWARE_REPAIR_LAB: 'IT_SUPPORT_HARDWARE',
  NETWORKING_CYBER_LAB: 'CYBER_SOC',
  AI_CLOUD_STUDIO: 'AI_ML_EDGE',
  CLIMATE_GIS_STUDIO: 'DATA_DASHBOARDS',
  DESIGN_BUILD_STUDIO: 'EMBEDDED_PROTOTYPING',
  INDUSTRY40_TWIN_LAB: 'HARDWARE_ENGINEERING',
  OFFLINE_LEARNING_STUDIO: 'DIGITAL_CONFIDENCE',
  NTN_LAB: 'WIRELESS_6G',
  APPRENTICESHIP_PROJECT_STUDIO: 'SEVEN_GC_APPRENTICESHIP',
  RECONSTRUCTION_DOCUMENTATION_STUDIO: 'DATA_DASHBOARDS',
});
