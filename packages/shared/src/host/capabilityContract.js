/** Host-neutral capability contract for 3k MLV universal shell. */

export const HOST_CAPABILITY_KEYS = Object.freeze([
  'filesystem',
  'notifications',
  'input',
  'external_display',
  'audio',
  'local_storage',
  'deep_links',
  'window_state',
  'secure_identity_handoff',
  'device_dock_state',
]);

export const CORE_WORLD_ROUTES = Object.freeze([
  'home',
  'campus',
  'gallery',
  'waike',
  'network_twin',
  'app_launch_intent',
  'privacy',
  'session_navigation',
]);

/**
 * @param {Record<string, boolean|string>} capabilities
 * @param {string} hostId
 */
export function createHostCapabilityContract(capabilities = {}, hostId = 'unknown') {
  const caps = {};
  for (const key of HOST_CAPABILITY_KEYS) {
    caps[key] = Boolean(capabilities[key]);
  }
  return Object.freeze({
    schema: 'gunnchos.mlv.host_capability_contract.v1',
    host_id: hostId,
    capabilities: caps,
    core_world_routes: [...CORE_WORLD_ROUTES],
    gunnchos_hard_dependency: false,
  });
}

export function assertCoreWorldHostNeutral(sourceText = '') {
  const banned = [
    /from\s+['"]gunnchos-device-os/,
    /require\(['"]gunnchos-device-os/,
    /GUNNCHOS_ONLY_API/,
  ];
  const hits = banned.filter((re) => re.test(sourceText)).map((re) => String(re));
  return {
    MLV_CORE_WORLD_NO_GUNNCHOS_HARD_DEPENDENCY_PASS: hits.length === 0,
    banned_hits: hits,
  };
}
